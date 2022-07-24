export interface IProvinceDto {
    id: string
    name: string
}

export interface ICommonService {
    getProvinces(): IProvinceDto[]
}
