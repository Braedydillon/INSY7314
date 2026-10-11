
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const postmanDir = path.resolve('../../postman');
const collectionDir = path.join(
  postmanDir,
  'collections',
  'HustleHub+ -Security Tests'
);

const outputFile = path.join(
  postmanDir,
  'HustleHub-Security-Tests.postman_collection.json'
);

const definition = YAML.parse(
  fs.readFileSync(
    path.join(collectionDir, '.resources', 'definition.yaml'),
    'utf8'
  )
);

const variables = (definition.variables || [])
  .filter(variable => !['adminEmail', 'adminPassword'].includes(variable.key))
  .map(variable => ({
    key: variable.key,
    value: variable.secret ? '' : String(variable.value ?? ''),
    type: 'string'
  }));

const requests = fs.readdirSync(collectionDir)
  .filter(file => file.endsWith('.request.yaml'))
  .map(file => {
    const data = YAML.parse(
      fs.readFileSync(path.join(collectionDir, file), 'utf8')
    );

    const events = (data.scripts || [])
      .filter(script => script.code?.trim())
      .map(script => ({
        listen: script.type === 'beforeRequest' ? 'prerequest' : 'test',
        script: {
          type: 'text/javascript',
          exec: script.code.split(/\r?\n/)
        }
      }));

    const request = {
      method: data.method || 'GET',
      header: [],
      url: data.url
    };

    if (data.body) {
      request.body = {
        mode: 'raw',
        raw: data.body.content || '',
        options: {
          raw: {
            language: data.body.type === 'json' ? 'json' : 'text'
          }
        }
      };

      if (data.body.type === 'json') {
        request.header.push({
          key: 'Content-Type',
          value: 'application/json'
        });
      }
    }

    if (data.auth?.type === 'bearer') {
      request.auth = {
        type: 'bearer',
        bearer: [{
          key: 'token',
          value: data.auth.credentials?.token || '',
          type: 'string'
        }]
      };
    } else {
      request.auth = {
        type: 'noauth'
      };
    }

    if (Array.isArray(data.headers)) {
      for (const header of data.headers) {
        if (header.key) {
          request.header.push({
            key: header.key,
            value: String(header.value ?? ''),
            disabled: Boolean(header.disabled)
          });
        }
      }
    }

    return {
      order: Number(data.order ?? 999999),
      item: {
        name: data.name || file.replace('.request.yaml', ''),
        request,
        event: events
      }
    };
  })
  .sort((a, b) => a.order - b.order);

// Test 31 is deliberately excluded from the normal Newman run.
// It must be tested separately to avoid blocking login requests.
const excluded = requests.filter(entry =>
  /^31\s*-/.test(entry.item.name)
);

const included = requests.filter(entry =>
  !/^31\s*-/.test(entry.item.name)
);

const collection = {
  info: {
    name: 'HustleHub+ - Security Tests',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: included.map(entry => entry.item),
  variable: variables
};

fs.writeFileSync(
  outputFile,
  JSON.stringify(collection, null, 2),
  'utf8'
);

console.log(`Converted ${included.length} requests.`);
console.log(`Excluded ${excluded.length} rate-limit request(s).`);
console.log(`Saved to: ${outputFile}`);
