import {MigrationScript, migrationScript} from 'loopback4-migration';
import {repository} from '@loopback/repository';
import {GROUPS, Logger} from '../utils';
import {service} from '@loopback/core';
import {KeycloakService} from '../services';
import {UserEntityRepository} from '../repositories';
import {Citizen, UserEntity} from '../models';

@migrationScript()
export class MigrationScript1210 implements MigrationScript {
  version = '1.21.0';
  scriptName = MigrationScript1210.name;
  description = 'Update Citizen with lastLoginAt, tos1 & tos2 timestamp';

  constructor(
    @repository(UserEntityRepository)
    public userEntityRepository: UserEntityRepository,
    @service(KeycloakService)
    public keycloakService: KeycloakService,
  ) {}

  async up(): Promise<void> {
    Logger.info(MigrationScript1210.name, this.up.name, 'Started');

    const citizenToUpdateList: UserEntity[] =
      await this.userEntityRepository.searchUserWithAttributesByFilter({}, GROUPS.citizens);

    await Promise.allSettled(
      citizenToUpdateList.map(async (citizenToUpdate: UserEntity) => {
        try {
          Logger.info(MigrationScript1210.name, this.up.name, `Start update citizen`, citizenToUpdate.id);

          const citizen: Citizen = citizenToUpdate.toCitizen();
          if (!citizen.lastLoginAt || !citizen.tos1 || !citizen.tos2) {
            if (!citizen.lastLoginAt) {
              citizen.lastLoginAt = citizen.updatedAt;
            }
            if (!citizen.tos1 || !citizen.tos2) {
              citizen.tos1 = true;
              citizen.tos2 = true;
            }
            await this.keycloakService.updateUserKC(citizen.id, citizen);
            Logger.info(MigrationScript1210.name, this.up.name, `Citizen Updated`, citizenToUpdate.id);
          } else {
            Logger.info(
              MigrationScript1210.name,
              this.up.name,
              `Citizen has lastLoginAt, tos1 & tos2 property`,
              citizenToUpdate.id,
            );
          }
        } catch (err) {
          Logger.error(
            MigrationScript1210.name,
            this.up.name,
            `Error while updating citizen`,
            citizenToUpdate.id,
          );
        }
      }),
    );

    Logger.info(MigrationScript1210.name, this.up.name, `Completed`);
  }
}
