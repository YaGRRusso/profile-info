import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { SkillsService } from './skills.service'
import { CreateSkillDto } from './dto/create-skill.dto'
import { UpdateSkillDto } from './dto/update-skill.dto'
import { SearchSkillDto } from './dto/search-skill.dto'
import { ApiTags } from '@nestjs/swagger'
import { IsPublic } from '@auth/decorators/public.decorator'

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto)
  }

  @IsPublic()
  @Get()
  findAll() {
    return this.skillsService.findAll()
  }

  @IsPublic()
  @Get('search')
  searchAll(@Body() searchSkillDto: SearchSkillDto) {
    return this.skillsService.searchAll(searchSkillDto)
  }

  @IsPublic()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id)
  }
}
