import { Injectable } from '@nestjs/common'
import { ClassConstructor, plainToInstance } from 'class-transformer'

@Injectable()
export class MapperService {
  toInstance<V, T>(object: V, cls: ClassConstructor<T>): T {
    return plainToInstance(cls, object, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
  }

  toInstanceListFromList<V, T>(list: V[], cls: ClassConstructor<T>): T[] {
    return list.map((item) =>
      plainToInstance(cls, item, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      }),
    )
  }
}
