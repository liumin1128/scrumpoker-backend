import { Body, Controller, Post } from '@nestjs/common';
import { ScrumpokerService } from './scrumpoker.service';
import { JoinRoomBody, Room } from './scrumpoker.interface';

@Controller('scrumpoker')
export class ScrumpokerController {
  constructor(private readonly scrumpokerService: ScrumpokerService) {}

  @Post('joinroom')
  async joinRoom(@Body() joinCatDto: JoinRoomBody): Promise<Room> {
    console.log('joinCatDto');
    console.log(joinCatDto);
    const room = await this.scrumpokerService.joinRoom(joinCatDto);
    console.log('room');
    console.log(room);
    return room;
  }
}
