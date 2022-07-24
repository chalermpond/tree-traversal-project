import {
    IAdmin,
    IAdminValidator,
} from './interface'
import { AdminModel } from './admin.model'
import * as _ from 'lodash'

export class AdminMapping {
    public static requestToAdminModelMapping(input: IAdminValidator, target?: IAdmin): IAdmin {
        let admin: any
        if (_.isNil(target)) {
            admin = new AdminModel()
        }

        if (!_.isNil(input.getUsername())) {
            admin._username = input.getUsername()
        }
        if (!_.isNil(input.getEmail())) {
            admin._email = input.getEmail()
        }
        if (!_.isNil(input.getPassword())) {
            admin.setPassword(input.getPassword())
        }

        return admin
    }
}
