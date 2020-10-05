import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import getClient from './utils/getClient';
import seedDatabase, {
  cityOne,
  cityTwo,
  cityThree
} from './utils/seedDatabase';

import { getCities, getCity } from './operations/city';

describe('City', () => {
  const defaultClient = getClient();

  beforeAll(seedDatabase);

  describe('Queries', () => {
    describe('cities', () => {
      test('Gets all cities from DB', async () => {
        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities });

        expect(cities.length).toBe(3);
      });

      test('Query filters cities by name', async () => {
        const variables = { query: 'Chula' };

        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities, variables });

        expect(cities.length).toBe(1);
      });

      test('Query filters cities by state', async () => {
        const variables = { query: 'Florida' };

        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities, variables });

        expect(cities.length).toBe(1);
      });

      test('Query filters cities by region', async () => {
        const variables = { query: 'Metro Manila' };

        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities, variables });

        expect(cities.length).toBe(1);
      });

      test('Query filters cities by country', async () => {
        const variables = { query: 'United States' };

        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities, variables });

        expect(cities.length).toBe(2);
      });

      test('First fetches first n cities', async () => {
        const variables = { first: 2 };

        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities, variables });

        expect(cities.length).toBe(2);
        expect(cities[0].id).toBe(cityOne.city.id);
        expect(cities[1].id).toBe(cityTwo.city.id);
      });

      test('Skip skips n cities', async () => {
        const variables = { skip: 2 };

        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities, variables });

        expect(cities.length).toBe(1);
        expect(cities[0].id).toBe(cityThree.city.id);
      });

      test('After gets cities after specified id', async () => {
        const variables = { after: cityOne.city.id };

        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities, variables });

        expect(cities.length).toBe(2);
        expect(cities[0].id).toBe(cityTwo.city.id);
      });

      test('orderBy sorts cities', async () => {
        const variables = { orderBy: 'name_DESC' };

        const {
          data: { cities }
        } = await defaultClient.query({ query: getCities, variables });

        expect(cities[0].name).toBe('Quezon City');
        expect(cities[2].name).toBe('Chula Vista');
      });
    });

    describe('city', () => {
      test('Error is thrown if city does not exist', async () => {
        const variables = { id: 'kasdhskljj' };

        await expect(
          defaultClient.query({ query: getCity, variables })
        ).rejects.toThrow('City not found.');
      });

      test('Correct city is returned', async () => {
        const variables = { id: cityTwo.city.id };

        const {
          data: { city }
        } = await defaultClient.query({ query: getCity, variables });

        expect(city.name).toBe(cityTwo.city.name);
      });
    });
  });
});
