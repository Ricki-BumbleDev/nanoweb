import Page from '../page';
import { html, renderToString } from '../../packages/template/src';

const Subject = Page(html);
const executeBenchmark = () => renderToString(Subject());
export default executeBenchmark;
