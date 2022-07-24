import { Inject } from '@nestjs/common'
import { ProviderName } from '../../provider'
import { IProvinceRepository } from './interface/repository.interface'
import {
    map,
    toArray,
} from 'rxjs/operators'
import {
    ICommonService,
    IProvinceDto,
} from './interface/service.interface'

const {
    ProvinceRepositoryProvider,
} = ProviderName

export class CommonService implements ICommonService {

    constructor(
        @Inject(ProvinceRepositoryProvider)
        private readonly _provinceRepository: IProvinceRepository,
    ) {
    }

    public getProvinces(): any {
        return this._provinceRepository.getProvinces().pipe(
            map(model => {
                const dto: IProvinceDto = {
                    id: model.getCode(),
                    name: model.getName(),
                }
                return dto
            }),
            toArray(),
        )
    }

}
