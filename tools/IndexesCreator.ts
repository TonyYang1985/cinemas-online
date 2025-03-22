import { IndexCreator } from '../src/fmk/libs/generator/IndexCreator';

if (require.main === module) {
  const creator = new IndexCreator({ rootDir: './src', verbose: true });
  creator.generate();
}
