import {
    IPolicyDto,
    IPolicyModel,
} from './interface'

export class PolicyDto {
    public static toPolicyDto(input: IPolicyModel): IPolicyDto {
        return {
            policy: input.getId(),
            name: input.getFullName(),
            citizen: input.getCitizen(),
            address: input.getAddress(),
            license: input.getLicensePlate(),
            province: input.getProvince(),
            chassis: input.getChassis(),
            brand: input.getBrand(),
            model: input.getmodel(),
            doc: input.getDoc(),
            start: input.getStart(),
            expire: input.getExpire(),
        }
    }
}
