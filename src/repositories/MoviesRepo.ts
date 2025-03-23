// {}
import { Service } from 'typedi';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@footy/fmk';
import { Movies } from '@footy/entities';

@Service()
export class MoviesRepo extends BaseRepository<Movies> {
  constructor(dataSource: DataSource) {
    super(dataSource, Movies);
  }

  async findById(id: string): Promise<Movies | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByTitle(title: string): Promise<Movies | null> {
    return this.repository.findOne({ where: { title } });
  }

  async findAll(): Promise<Movies[]> {
    return this.repository.find();
  }

  async createMovie(movie: Partial<Movies>): Promise<Movies> {
    const newMovie = this.repository.create(movie);
    return this.repository.save(newMovie);
  }

  async updateMovie(id: string, movieData: Partial<Movies>): Promise<Movies | null> {
    await this.repository.update(id, movieData);
    return this.findById(id);
  }

  async deleteMovie(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
