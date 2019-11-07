import {
  getBestOffers,
  getBestScenario,
  getOverlappingScenarios,
  findLeastClearanceNeeded,
  calcOfferGain,
  filterOffers,
} from './index';

export const itemValues = {a: 1, b: 1, c: 1, d: 1, e: 1, f: 1};
export const chosenItems = {a: 1, b: 2, c: 1, d: 1, e: 1, f: 1};
export const applicableOffers = {
  overlap: {
    combination: { b: 1, c: 1, d: 1 },
    value: 2,
  },
  left: {
    combination: { a: 1, b: 1, c: 1 },
    value: 2,
  },
  right: {
    combination: { d: 1, e: 1, f: 1 },
    value: 2,
  }
};

describe('The MixMatch calculation module', () => {

  it('should find the highest potential of combination', () => {
    const bestOffers = getBestOffers(applicableOffers, chosenItems, itemValues);
    expect(bestOffers).toEqual({ appliedOffers: [ 'left', 'right' ], gain: -2 });
  });

  it('should determine the highest gain of all scenarios', () => {
    const bestScenario = getBestScenario([
      {scn: 'a', gain: 0},
      {scn: 'b', gain: -2},
      {scn: 'c', gain: -4},
      {scn: 'd', gain: 4},
      {scn: 'e', gain: 4},
    ]);
    expect(bestScenario.scn).toEqual('c');
  });

  it('should be able to determine which scenarios overlap', () => {
    const overlappingScenarios = getOverlappingScenarios(applicableOffers, chosenItems, itemValues);
    expect(overlappingScenarios).toEqual(    [
      { appliedOffers: [ 'overlap' ], gain: -1 },
      { appliedOffers: [ 'left', 'right' ], gain: -2 },
      { appliedOffers: [ 'right' ], gain: -1 },
      { appliedOffers: [], gain: 0 }
    ]);
  });

  it('should be able to determine which offer should be removed for the next scenario', () => {
    expect(findLeastClearanceNeeded({
      prd1: ['a','b'],
      prd2: ['b'],
    })).toEqual(['b']);

    expect(findLeastClearanceNeeded({
      prd1: ['b','c'],
      prd2: ['a','b','c'],
    })).toEqual(['b','c']);
  });

  it('should be able to calculate the offer gain for a scenario', () => {
    expect(calcOfferGain(['overlap'], applicableOffers, itemValues))
      .toEqual(-1);
    expect(calcOfferGain(['left', 'right'], applicableOffers, itemValues))
      .toEqual(-2);
    expect(calcOfferGain(['left', 'right', 'overlap'], applicableOffers, itemValues))
      .toEqual(-3);
  });

  it('should be able to make a combination of offers on a basket that don\'t overlap', () => {
    expect(filterOffers(applicableOffers, chosenItems))
      .toEqual({
        "allowed": ["overlap"],
        "allowedPerItem": {
          "b": ["overlap"],
          "c": ["overlap"],
          "d": ["overlap"],
        },
        "availableItems": {
          "a": 1,
          "b": 1,
          "e": 1,
          "f": 1,
        },
        "overlapping": ["left", "right"],
      });

    const nextIter = JSON.parse(JSON.stringify(applicableOffers));
    delete nextIter.overlap;

    expect(filterOffers(nextIter, chosenItems))
      .toEqual({
        "allowed": ["left", "right"],
        "allowedPerItem": {
          "a": ["left"],
          "b": ["left"],
          "c": ["left"],
          "d": ["right"],
          "e": ["right"],
          "f": ["right"],
        },
        "availableItems": {
          "b": 1
        },
        "overlapping": [],
      });
  })

});
