import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { CommonModule } from './common/common.module';
import { TaskModule } from './task/task.module';
import { CommonResolver } from './common/common.resolver';
import { CommonService } from './common/common.service';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CommonModule, TaskModule],
  controllers: [AppController],
  providers: [AppService, CommonService, CommonResolver],
})
export class AppModule {}
