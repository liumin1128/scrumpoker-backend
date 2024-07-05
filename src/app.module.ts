import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrumpokerModule } from './scrumpoker/scrumpoker.module';

@Module({
  imports: [ScrumpokerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
