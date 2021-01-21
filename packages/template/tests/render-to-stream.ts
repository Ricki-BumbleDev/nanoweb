import { Readable } from 'stream';
import { html, Template } from '../src/index';
import { renderToStream, RenderOptions } from '../src/render-to-stream';

const toString = (stream: Readable) => {
  let buffer = '';
  stream.on('data', (data: string) => (buffer += data));
  return new Promise(resolve => stream.on('end', () => resolve(buffer)));
};

const matchSnapshot = async (getComponent: () => Template | Promise<Template>, options?: RenderOptions) =>
  expect(await toString(renderToStream(getComponent(), options))).toMatchSnapshot();

describe('Render to stream', () => {
  test('without options', async () => {
    await matchSnapshot(
      () => html`
        <html>
          <head></head>
          <body>
            content
          </body>
        </html>
      `,
    );
  });
});
