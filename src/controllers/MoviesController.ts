import { Get, JsonController, Logger, Post, Put, Delete, rest } from '@footy/fmk';
import { Inject } from 'typedi';
import { Movies } from '@footy/entities';
import { MoviesService } from '@footy/services';
import { Body, Param } from 'routing-controllers';
import { CreateMoviesRequest, UpdateMoviesRequest } from '@footy/vo';

@JsonController('/movies')
export class MoviesController {
  private logger = Logger.getLogger(MoviesController);

  @Inject()
  private moviesService: MoviesService;

  @Get('', '*', 'cinemas-online.movies.getAll')
  async getAllMovies(): Promise<Movies[]> {
    return this.moviesService.findAll();
  }

  @Get('/:id', '*', 'cinemas-online.movies.getById')
  async getMovieById(@Param('id') id: string): Promise<Movies | null> {
    return this.moviesService.findById(id);
  }

  @Get('/:id/available-seats', '*', 'cinemas-online.movies.getAvailableSeats')
  async getAvailableSeats(@Param('id') id: string): Promise<{ row: string; seatNumber: number }[]> {
    return this.moviesService.getAvailableSeats(id);
  }

  @Post('', '*', 'cinemas-online.movies.create')
  async createMovie(@Body() request: CreateMoviesRequest): Promise<Movies> {
    return this.moviesService.createMovie(request);
  }

  @Put('/:id', '*', 'cinemas-online.movies.update')
  async updateMovie(@Param('id') id: string, @Body() request: UpdateMoviesRequest): Promise<Movies | null> {
    return this.moviesService.updateMovie(id, request);
  }

  @Delete('/:id', '*', 'cinemas-online.movies.delete')
  async deleteMovie(@Param('id') id: string): Promise<void> {
    await this.moviesService.deleteMovie(id);
  }
}
