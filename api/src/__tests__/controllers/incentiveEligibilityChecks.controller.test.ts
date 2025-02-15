import {createStubInstance, expect, StubbedInstanceWithSinonAccessor} from '@loopback/testlab';

import {IncentiveEligibilityChecksController} from '../../controllers';
import {IncentiveEligibilityChecks} from '../../models';
import {IncentiveEligibilityChecksRepository} from '../../repositories';

describe('Incentives Controller', () => {
  let repository: StubbedInstanceWithSinonAccessor<IncentiveEligibilityChecksRepository>,
    controller: IncentiveEligibilityChecksController;

  beforeEach(() => {
    givenStubbedRepositoryIncentiveEligibilityChecks();
    controller = new IncentiveEligibilityChecksController(repository);
  });

  it('IncentiveEligibilityChecksController getEligibilityChecks : ERROR', async () => {
    try {
      repository.stubs.find.rejects(new Error('Error'));
      await controller.getEligibilityChecks();
    } catch (err) {
      expect(err.message).to.equal('Error');
    }
  });

  it('IncentiveEligibilityChecksController getEligibilityChecks : successful', async () => {
    repository.stubs.find.resolves([IncentiveEligibilityChecksMock]);
    const result = await controller.getEligibilityChecks();

    expect(result).to.deepEqual([IncentiveEligibilityChecksMock]);
  });

  function givenStubbedRepositoryIncentiveEligibilityChecks() {
    repository = createStubInstance(IncentiveEligibilityChecksRepository);
  }
});

const IncentiveEligibilityChecksMock = Object.assign(new IncentiveEligibilityChecks(), {
  id: 'uuid-controle-fc',
  name: 'Identité FranceConnect',
  label: 'identité_franceConnect',
  description: "Les données d'identité doivent être fournies/certifiées par FranceConnect",
  type: 'boolean',
  motifRejet: 'CompteNonFranceConnect',
});
