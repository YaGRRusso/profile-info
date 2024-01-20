import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common'
import { FormationsService } from '../formations/formations.service'
import { CreateFormationDto } from '../formations/dto/create-formation.dto'
import { UpdateFormationDto } from '../formations/dto/update-formation.dto'
import { SearchFormationDto } from '../formations/dto/search-formation.dto'
import { ApiTags } from '@nestjs/swagger'
import { IsPublic } from '@auth/decorators/public.decorator'
import { AuthRequest } from '@auth/entities/request.entity'

@ApiTags('formations')
@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @IsPublic()
  @Get()
  findAll() {
    return this.formationsService.findAll()
  }

  @IsPublic()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formationsService.findOne(id)
  }

  @IsPublic()
  @Get('/search')
  searchAll(@Body() searchFormationDto: SearchFormationDto) {
    return this.formationsService.searchAll(searchFormationDto)
  }

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createFormationDto: CreateFormationDto,
  ) {
    return this.formationsService.create(req.user.id, createFormationDto)
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateFormationDto: UpdateFormationDto,
  ) {
    return this.formationsService.update(req.user.id, id, updateFormationDto)
  }

  @Patch(':id/skills/add')
  addSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateFormationDto,
  ) {
    return this.formationsService.addSkills(req.user.id, id, skills)
  }

  @Patch(':id/skills/remove')
  removeSkills(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() { skills }: UpdateFormationDto,
  ) {
    return this.formationsService.removeSkills(req.user.id, id, skills)
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.formationsService.remove(req.user.id, id)
  }
}
