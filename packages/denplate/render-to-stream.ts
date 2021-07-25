import { PassThrough, Readable, Transform } from 'https://deno.land/std@0.102.0/node/stream.ts';
import { setImmediate } from 'https://deno.land/std@0.102.0/node/timers.ts';
import { Template } from './html.ts';

const resolve = async (stream: PassThrough, component: Template | Promise<Template>, webComponents: string[]) => {
  const list = await component;
  webComponents.push(...list.webComponents);
  for (const item of list) {
    if (item !== undefined) {
      const resolvedItem = await item;
      if (resolvedItem instanceof Template) {
        await resolve(stream, resolvedItem, webComponents);
      } else if (resolvedItem || resolvedItem === 0) {
        stream.write(resolvedItem);
      }
    }
  }
};

type Transformer = (text: string, webComponents: string[]) => string;

export interface StreamRenderOptions {
  /** Allows to apply a transformation to each chunk of stream output */
  transformResult?: Transformer;
  /** Allows to set a custom buffer size in byte. Default: 1024 */
  bufferSize?: number;
}

const getBuffer = (bufferSize = 1024, webComponents: string[], transform?: Transformer) => {
  let buffer = '';
  return new Transform({
    decodeStrings: false,
    transform(text: string, _encoding, done) {
      buffer += text;
      if (buffer.length >= bufferSize) {
        this.push(transform?.(buffer, [...new Set(webComponents)]) || buffer);
        buffer = '';
      }
      done();
    },
    final(this, done) {
      this.push(transform?.(buffer, [...new Set(webComponents)]) || buffer);
      done();
    },
  });
};

export const renderToStream = (component: Template | Promise<Template>, options?: StreamRenderOptions): Readable => {
  const webComponents: string[] = [];
  const sink = getBuffer(options?.bufferSize, webComponents, options?.transformResult);
  setImmediate(async () => {
    await resolve(sink, component, webComponents);
    sink.end();
  });
  return sink;
};
