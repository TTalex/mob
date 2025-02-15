/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-fragments */
import React, { FC, useState, useEffect, ReactNode } from 'react';
import { Link } from 'gatsby';
import { Breadcrumb } from 'gatsby-plugin-breadcrumb';

import Layout from '@components/Layout/Layout';
import Heading from '@components/Heading/Heading';
import SearchForm from '@components/SearchForm/SearchForm';
import CardLine from '@components/CardLine/CardLine';
import CardLineColumn from '@components/CardLine/CardLineColumn';
import CardLineContent from '@components/CardLine/CardLineContent';
import Button from '@components/Button/Button';
import TooltipInfoIcon from '@components/TooltipInfoIcon/TooltipInfoIcon';

import { getCitizensCount, getCitizens, Citizen } from '@api/CitizenService';

import { useRoleAccepted } from '@utils/keycloakUtils';
import { firstCharUpper } from '@utils/helpers';

import { useUser } from '@context';

import Strings from './locale/fr.json';

import { Roles } from '../../../../constants';

import './_manageCitizens.scss';
import { PartialCitizen } from 'src/utils/citoyens';

interface ManageCitizensProps {
  pageContext: { breadcrumb: { crumbs: Crumb[] } };
}

interface Crumb {
  crumbLabel: string;
  pathname: string;
}

interface CitizensCount {
  count: number;
}

/**
 * @name ManageCitizens
 * @description This component is for either managers or supervisors to see a list of citizens with at least one demande in their collectivitie
 * @type [Business Controller]
 */

const ManageCitizens: FC<ManageCitizensProps> = ({ pageContext }) => {
  const LIMIT = 10;
  const [citizens, setCitizens] = useState<PartialCitizen[]>([]);
  const [totalCitizens, setTotalCitizens] = useState<number>(0);
  const [searchByLastName, setSearchByLastName] = useState<string>('');
  const [pagination, setPagination] = useState<number>(0);
  const [pageContent, setPageContent] = useState<ReactNode>();
  const { userFunder } = useUser();

  const isManager: boolean = useRoleAccepted(Roles.MANAGERS);

  const {
    breadcrumb: { crumbs, crumbLabel },
  } = pageContext;

  /**
   * get citizens list
   * @param funderId funder Id
   * @param lastName citizen lastName
   * @param skip demandes skipped
   */
  const getCitizensList = async (): Promise<void> => {
    const result: PartialCitizen[] = await getCitizens(
      userFunder.funderId,
      searchByLastName,
      LIMIT,
      pagination
    );

    setCitizens([...citizens, ...result]);
  };

  /**
   * get citizens count
   * @param funderId funder Id
   * @param lastName citizen lastName
   */
  const getCount = async (): Promise<void> => {
    const result: CitizensCount = await getCitizensCount(
      userFunder.funderId,
      searchByLastName
    );

    setTotalCitizens(result?.count);
  };

  /**
   * triggered after clicking on see more
   * or a search
   */
  useEffect(() => {
    getCitizensList();
  }, [pagination, searchByLastName]);

  /**
   * triggered a search
   *
   */
  useEffect(() => {
    getCount();
  }, [searchByLastName]);

  /**
   * on click btn see more
   */
  const getMoreCitizens = () => {
    setPagination(pagination + 10);
  };

  /**
   * handle search by citizen's name
   * @param value searched term
   */
  const handleChangeSearch = (value: string) => {
    setCitizens([]);
    setPagination(0);
    setSearchByLastName(value);
  };

  /**
   * populate page content
   * @returns JSX node
   */
  const cardLineJSX = () => {
    let JSXNode: ReactNode = (
      <div className="mcm-employee-no-demande">
        {Strings['dashboard.manage.citizens.no.search.result']}
      </div>
    );
    if (citizens && citizens.length) {
      JSXNode = citizens.map(
        ({ id, firstName, lastName, isCitizenDeleted }) => (
          <CardLine classnames="citizens-card" key={id}>
            <CardLineContent classnames="citizens-card__name span">
              <CardLineColumn classnames="citizens-card__error-icon">
                {isCitizenDeleted && (
                  <TooltipInfoIcon
                    tooltipContent={
                      Strings['dashboard.manage.citizen.deleted.account']
                    }
                    iconName="error"
                    iconSize={30}
                  />
                )}
                <span>{`${firstCharUpper(
                  firstName
                )} ${lastName.toUpperCase()}`}</span>
              </CardLineColumn>
              {isManager && (
                <>
                  <CardLineColumn>
                    <Link
                      id={`gerer-citoyens-${id}`}
                      to={`/gerer-citoyens/${id}`}
                      state={{ firstName, lastName, isCitizenDeleted }}
                    >
                      <Button secondary>
                        {
                          Strings[
                            'dashboard.manage.citizens.button.view.requests'
                          ]
                        }
                      </Button>
                    </Link>
                  </CardLineColumn>
                </>
              )}
            </CardLineContent>
          </CardLine>
        )
      );
    }
    return JSXNode;
  };

  /**
   * create page content
   */
  useEffect(() => {
    const PageComponent = cardLineJSX();
    setPageContent(PageComponent);
    return () => {
      setPageContent([]);
    };
  }, [citizens, isManager]);

  return (
    <Layout
      fullWidth
      footer={{
        imageFilename: 'man-riding-bike.jpg',
      }}
      pageTitle={Strings['dashboard.manage.citizens.title']}
    >
      <div className="page-container">
        <Breadcrumb
          crumbLabel={crumbLabel}
          crumbs={crumbs}
          crumbSeparator=" > "
        />
      </div>
      <div>
        <section className="page-container">
          <div className="m-yellow-bg-wrapper">
            <Heading level="h1">
              {Strings['dashboard.manage.citizens.title']}
            </Heading>
          </div>
        </section>
        <div className="mcm-tabs mcm-tabs__content has-info">
          <div className="page-container__list-section">
            <div>
              <SearchForm
                searchText={searchByLastName}
                onSubmit={handleChangeSearch}
                placeholder={
                  Strings['dashboard.manage.citizens.search.placeholder']
                }
              />
              <div className="total-citizens">
                {`${totalCitizens} ${Strings['dashboard.manage.citizens.total.count']}`}
              </div>
            </div>
            <div>
              <>
                {pageContent}
                {totalCitizens !== citizens?.length && (
                  <div className="load-more-btn">
                    <Button secondary onClick={() => getMoreCitizens()}>
                      {Strings['dashboard.manage.citizens.get.more.citizens']}
                    </Button>
                  </div>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageCitizens;
