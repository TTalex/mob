import {createStubInstance, expect, sinon, StubbedInstanceWithSinonAccessor} from '@loopback/testlab';

import {KeycloakService} from '../../services';
import {GROUPS, StatusCode} from '../../utils';
import {KeycloakGroupRepository, UserEntityRepository} from '../../repositories';
import {GroupAttribute, KeycloakGroup, User} from '../../models';
import {Count, DefaultHasManyRepository, HasManyRepository} from '@loopback/repository';

describe('keycloak services', () => {
  let kc: any = null;

  let keycloakGroupRepository: StubbedInstanceWithSinonAccessor<KeycloakGroupRepository>,
    userEntityRepository: StubbedInstanceWithSinonAccessor<UserEntityRepository>,
    constrainedGroupAttributeRepo: StubbedInstanceWithSinonAccessor<HasManyRepository<GroupAttribute>>,
    groupAttributes: sinon.SinonStub<GroupAttribute[], []>,
    create: sinon.SinonStub<any[], Promise<GroupAttribute>>,
    find: sinon.SinonStub<any[], Promise<GroupAttribute[]>>,
    patch: sinon.SinonStub<any[], Promise<Count>>,
    del: sinon.SinonStub<any[], Promise<Count>>;

  beforeEach(() => {
    keycloakGroupRepository = createStubInstance(KeycloakGroupRepository);
    userEntityRepository = createStubInstance(UserEntityRepository);

    kc = new KeycloakService(keycloakGroupRepository, userEntityRepository);

    constrainedGroupAttributeRepo =
      createStubInstance<HasManyRepository<GroupAttribute>>(DefaultHasManyRepository);

    groupAttributes = sinon.stub().withArgs('randomGroupId').returns(constrainedGroupAttributeRepo);
    (keycloakGroupRepository as any).groupAttributes = groupAttributes;

    // Setup CRUD fakes
    ({create, find, patch, delete: del} = constrainedGroupAttributeRepo.stubs as any);
  });

  it('deleteUserKc : successful', async () => {
    const message = 'user supprimé';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'del').resolves(message);

    const result = await kc.deleteUserKc('randomId');

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.del.restore();

    expect(result).equal(message);
  });

  it('deleteUserKc fail : connection fails', async () => {
    const errorMessage = 'connexion échoue';
    sinon.stub(kc.keycloakAdmin, 'auth').rejects(errorMessage);

    await kc.deleteUserKc('randomId').catch((error: any) => {
      expect(error.errors).to.equal(errorMessage);
    });

    kc.keycloakAdmin.auth.restore();
  });

  it('createUserKc Citizen: successful', async () => {
    const message = 'user créé';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'create').resolves(message);

    const result = await kc.createUserKc({
      email: 'test@gmail.com',
      lastName: 'testLName',
      firstName: 'testFName',
      group: [GROUPS.citizens],
    });

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.create.restore();

    expect(result).equal(message);
  });

  it('createUserKc Funder: successful', async () => {
    const message = 'user créé';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'create').resolves(message);

    const result = await kc.createUserKc({
      email: 'test@gmail.com',
      lastName: 'testLName',
      firstName: 'testFName',
      funderName: 'Funder',
      group: ['collectivités'],
    });

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.create.restore();

    expect(result).equal(message);
  });

  it('createUserKc fail : email not unique', async () => {
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'create').rejects({response: {status: StatusCode.Conflict}});

    await kc
      .createUserKc(
        new User({
          email: 'test@gmail.com',
          lastName: 'testLName',
          firstName: 'testFName',
        }),
        ['collectivités', 'financeurs'],
      )
      .catch((error: any) => {
        expect(error.message).to.equal('email.error.unique');
        expect(error.statusCode).to.equal(StatusCode.Conflict);
      });
    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.create.restore();
  });

  it('createUserKc fail : password does not met policies', async () => {
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'create').rejects({
      response: {
        status: 400,
        data: {errorMessage: 'Password policy not met'},
      },
    });

    await kc
      .createUserKc({
        email: 'test@gmail.com',
        lastName: 'testLName',
        firstName: 'testFName',
        group: ['collectivités'],
      })
      .catch((error: any) => {
        expect(error.message).to.equal('password.error.format');
        expect(error.statusCode).to.equal(StatusCode.UnprocessableEntity);
      });

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.create.restore();
  });

  it('createUserKc fail : missing properties', async () => {
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'create').rejects('test');

    await kc
      .createUserKc({
        email: 'test@gmail.com',
        lastName: 'testLName',
        firstName: 'testFName',
      })
      .catch((error: any) => {
        expect(error.message).to.equal('Error');
      });

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.create.restore();
  });

  it('createUserKc fail : connection fails', async () => {
    sinon.stub(kc.keycloakAdmin, 'auth').rejects('connexion échoue');

    await kc
      .createUserKc({
        email: 'test@gmail.com',
        lastName: 'testLName',
        firstName: 'testFName',
        group: ['collectivités'],
      })
      .catch((error: any) => {
        expect(error.message).to.equal('Error');
      });

    kc.keycloakAdmin.auth.restore();
  });

  it('createGroupKc fail: no top group found', async () => {
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');
    sinon.stub(kc.keycloakAdmin.groups, 'find').resolves([]);

    await kc.createGroupKc('group', 'collectivités').catch((error: any) => {
      expect(error.message).to.equal('collectivités.error.topgroup');
    });

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.groups.find.restore();
  });

  it('createGroupKc fail : funder not unique', async () => {
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');
    sinon.stub(kc.keycloakAdmin.groups, 'find').resolves([{id: 'someWeirdId'}]);
    sinon
      .stub(kc.keycloakAdmin.groups, 'setOrCreateChild')
      .rejects({response: {status: StatusCode.Conflict}});

    await kc.createGroupKc('group', 'collectivités').catch((error: any) => {
      expect(error.message).to.equal('collectivités.error.name.unique');
    });

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.groups.find.restore();
    kc.keycloakAdmin.groups.setOrCreateChild.restore();
  });

  it('createGroupKc : successful', async () => {
    const messageSucces = 'funder créé';

    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');
    sinon.stub(kc.keycloakAdmin.groups, 'find').resolves([{id: 'someWeirdId'}]);
    sinon.stub(kc.keycloakAdmin.groups, 'setOrCreateChild').resolves(messageSucces);

    const result = await kc.createGroupKc('group', 'collectivités');
    expect(result).to.equal(messageSucces);

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.groups.find.restore();
    kc.keycloakAdmin.groups.setOrCreateChild.restore();
  });

  it('createGroupKc fail : connection fails', async () => {
    sinon.stub(kc.keycloakAdmin, 'auth').rejects('connexion échoue');

    await kc.createGroupKc('group', 'collectivités').catch((error: any) => {
      expect(error.message).to.equal('Error');
    });

    kc.keycloakAdmin.auth.restore();
  });

  it('deleteGroupKc : successful', async () => {
    const message = 'groupe supprimé';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.groups, 'del').resolves(message);

    const result = await kc.deleteGroupKc('randomId');

    expect(result).equal(message);

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.groups.del.restore();
  });

  it('deleteGroupKc fail : connection fails', async () => {
    const errorMessage = 'connexion échoue';
    sinon.stub(kc.keycloakAdmin, 'auth').rejects(errorMessage);

    await kc.deleteGroupKc('randomId').catch((error: any) => {
      expect(error.errors).to.equal(errorMessage);
    });

    kc.keycloakAdmin.auth.restore();
  });

  it('sendExecuteActionsEmailUserKc fails : can not send email', async () => {
    const message = 'email non envoyé';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');
    sinon.stub(kc.keycloakAdmin.users, 'executeActionsEmail').rejects(message);

    await kc.sendExecuteActionsEmailUserKc('randomId').catch((error: any) => {
      expect(error.errors).to.equal(message);
    });

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.executeActionsEmail.restore();
  });

  it('sendExecuteActionsEmailUserKc : Successful', async () => {
    const message = 'email envoyé';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');
    sinon.stub(kc.keycloakAdmin.users, 'executeActionsEmail').resolves(message);

    const result = await kc.sendExecuteActionsEmailUserKc('randomId');

    expect(result).equal(message);

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.executeActionsEmail.restore();
  });

  it('updateUserKC fail : connection fails', async () => {
    const errorMessage = 'connexion échoue';
    sinon.stub(kc.keycloakAdmin, 'auth').rejects(errorMessage);

    await kc
      .updateUserKC('randomId', {
        firstName: 'firstName',
        lastName: 'lastName',
      })
      .catch((error: any) => {
        expect(error.message).to.equal('cannot connect to IDP or add user');
      });

    kc.keycloakAdmin.auth.restore();
  });

  it('updateUserKC succes', async () => {
    const messageSuccess = 'modification reussie';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');
    sinon.stub(kc.keycloakAdmin.users, 'update').resolves(messageSuccess);
    const result = await kc.updateUserKC(
      'randomId',
      new User({
        firstName: 'firstName',
        lastName: 'lastName',
      }),
    );
    sinon.assert.calledWithExactly(
      kc.keycloakAdmin.users.update,
      {id: 'randomId'},
      {firstName: 'firstName', lastName: 'lastName'},
    );
    expect(result).to.equal(messageSuccess);
    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.update.restore();
  });

  it('sendExecuteActionsEmailUserKc fail : connection fails', async () => {
    const errorMessage = 'connexion échoue';
    sinon.stub(kc.keycloakAdmin, 'auth').rejects(errorMessage);

    await kc.sendExecuteActionsEmailUserKc('randomId').catch((error: any) => {
      expect(error.errors).to.equal(errorMessage);
    });
    kc.keycloakAdmin.auth.restore();
  });

  it('updateUserGroupsKc success :', async () => {
    const groups = [
      {id: '123', name: 'superviseurs'},
      {id: '345', name: 'gestionnaires'},
    ];
    keycloakGroupRepository.stubs.getSubGroupFunder.resolves(groups);
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'delFromGroup').resolves('groupe supprimé');
    sinon.stub(kc.keycloakAdmin.users, 'addToGroup').resolves('groupe ajouté');

    await kc.updateUserGroupsKc('id', ['superviseurs']);
    sinon.assert.calledWithExactly(kc.keycloakAdmin.users.delFromGroup, {
      id: 'id',
      groupId: '123',
    });
    sinon.assert.calledWithExactly(kc.keycloakAdmin.users.delFromGroup, {
      id: 'id',
      groupId: '345',
    });
    sinon.assert.calledWithExactly(kc.keycloakAdmin.users.addToGroup, {
      id: 'id',
      groupId: '123',
    });
    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.delFromGroup.restore();
    kc.keycloakAdmin.users.addToGroup.restore();
  });

  it('updateUserGroupsKc fail : connection fails', async () => {
    const errorMessage = 'connexion échoue';
    const groups = [
      {id: '123', name: 'superviseurs'},
      {id: '345', name: 'gestionnaires'},
    ];
    keycloakGroupRepository.stubs.getSubGroupFunder.resolves(groups);
    sinon.stub(kc.keycloakAdmin, 'auth').rejects(errorMessage);

    await kc.updateUserGroupsKc('randomId', ['superviseurs']).catch((error: any) => {
      expect(error.message).to.equal('cannot connect to IDP or add user');
    });

    kc.keycloakAdmin.auth.restore();
  });

  it('listConsents : successful', async () => {
    const consentList = [
      {
        clientName: 'simulation maas client',
        theClientId: 'simulation-maas-client',
      },
      {
        clientName: 'mulhouse maas client',
        theClientId: 'mulhouse-maas-client',
      },
      {
        clientName: 'paris maas client',
        theClientId: 'paris-maas-client',
      },
    ];
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'listConsents').resolves(consentList);

    const result = await kc.listConsents('randomId');
    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.listConsents.restore();

    expect(result).equal(consentList);
  });

  it('listConsents fail: connection fails', async () => {
    const errorMessage = 'connexion échoue';
    sinon.stub(kc.keycloakAdmin, 'auth').rejects(errorMessage);

    await kc.listConsents('randomId').catch((error: any) => {
      expect(error.errors).to.equal(errorMessage);
    });

    kc.keycloakAdmin.auth.restore();
  });

  it('deleteConsent : successful', async () => {
    const message = 'Grant revoked successfully';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');

    sinon.stub(kc.keycloakAdmin.users, 'revokeConsent').resolves(message);
    const result = await kc.deleteConsent('randomId');

    expect(result).to.equal(message);

    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.revokeConsent.restore();
  });

  it('deleteConsent fail: connection fails', async () => {
    const errorMessage = 'connexion échoue';
    sinon.stub(kc.keycloakAdmin, 'auth').rejects(errorMessage);

    await kc.deleteConsent('randomId', 'simulation-maas-client').catch((error: any) => {
      expect(error.errors).to.equal(errorMessage);
    });

    kc.keycloakAdmin.auth.restore();
  });

  it('getUser : successful', async () => {
    const message = 'user renvoyé';
    sinon.stub(kc.keycloakAdmin, 'auth').resolves('connexion réussie');
    sinon.stub(kc.keycloakAdmin.users, 'findOne').resolves(message);

    const result = await kc.getUser('randomId');
    kc.keycloakAdmin.auth.restore();
    kc.keycloakAdmin.users.findOne.restore();

    expect(result).equal(message);
  });

  it('getUser fails : connection fails', async () => {
    const errorMessage = 'connexion échoue';
    sinon.stub(kc.keycloakAdmin, 'auth').rejects(errorMessage);

    await kc.getUser('randomId').catch((error: any) => {
      expect(error.message).to.equal('Error');
    });

    kc.keycloakAdmin.auth.restore();
  });

  it('getAttributesFromGroup : returns objects of attributes', async () => {
    keycloakGroupRepository.stubs.getGroupById.resolves(
      new KeycloakGroup({
        id: 'randomGroupId',
        name: 'grp1',
        parentGroup: '',
        realmId: 'realm',
      }),
    );

    find.resolves([
      {name: 'attribute1', value: 'value1'},
      {name: 'attribute2', value: 'value2'},
    ] as GroupAttribute[]);

    const result = await kc.getAttributesFromGroup(['attribute1, attribute2'], 'funderName', 'randomGroupId');

    expect(result).to.eql({attribute1: 'value1', attribute2: 'value2'});
  });

  it('getAttributesFromGroup : returns empty object', async () => {
    keycloakGroupRepository.stubs.getGroupById.resolves(null);

    find.resolves([]);
    const result = await kc.getAttributesFromGroup(['attribute1, attribute2'], 'funderName', 'randomGroupId');

    expect(result).to.eql({});
  });
});
