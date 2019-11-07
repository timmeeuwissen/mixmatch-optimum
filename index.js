export const filterOffers = (offers, items) =>
  Object.keys(offers).reduce((acc, offerKey) => {
    const offer = offers[offerKey];
    const allowed = !Object.keys(offer.combination).find(
      key => !(acc.availableItems.hasOwnProperty(key) && acc.availableItems[key] >= offer.combination[key])
    );

    (allowed ? acc.allowed : acc.overlapping).push(offerKey);

    if (allowed) {
      Object.keys(offer.combination).forEach(key => {
        if (acc.availableItems.hasOwnProperty(key)) {
          acc.availableItems[key]--;
          if (acc.availableItems[key]<=0) {
            delete acc.availableItems[key];
          }
        }
        acc.allowedPerItem[key] = [...(acc.allowedPerItem.hasOwnProperty(key) ? acc.allowedPerItem[key] : []), offerKey];
      });
    }

    return acc;
  }, {
    allowed: [],
    overlapping: [],
    allowedPerItem: {},
    availableItems: Object.assign({}, items),
  });

export const calcOfferGain = (allowed, offers, itemValues) => {
  let gain = 0;
  allowed.forEach(offerKey => {
    const offer = offers[offerKey];
    let original = 0;
    Object.keys(offer.combination).forEach(itemId => {
      const qty = offer.combination[itemId];
      original += qty * itemValues[itemId];
    });

    // fixed price
    if (offer.hasOwnProperty('value')) {
      gain += offer.value - original;
    }
    // percentage
    else if (offer.hasOwnProperty('pct')) {
      gain -= original * (offer[pct] / 100);
    }
  });

  return gain;
};

export const findLeastClearanceNeeded = allowedPerItem =>
  Object
    .keys(allowedPerItem)
    .reduce((acc, curr) => [...acc, allowedPerItem[curr]], [])
    .sort((a,b) => a.length - b.length)
    .shift();


export const getOverlappingScenarios = (offers, items, itemValues) => {
  let offerKeys = Object.keys(offers).reduce((acc, curr) => ({...acc, [curr]: true}), {});
  let scenarios = [];
  let leastClearanceNeeded;

  do {
    const includedOffers = Object.keys(offerKeys).reduce((acc, curr) => {
      if(offerKeys[curr]) {
        acc[curr] = offers[curr];
      }
      return acc;
    }, {});

    const {allowed, allowedPerItem} = filterOffers(includedOffers, items);

    leastClearanceNeeded = findLeastClearanceNeeded(allowedPerItem);
    if (leastClearanceNeeded) {
      leastClearanceNeeded.forEach(key => offerKeys[key] = false);
    }

    const offerGain = calcOfferGain(allowed, offers, itemValues);

    scenarios.push({
      appliedOffers: allowed,
      gain: offerGain,
    });
  }
  while (leastClearanceNeeded);

  return scenarios;
}

export const getBestScenario = overlappingScenarios =>
  overlappingScenarios
    .sort((a,b) => a.gain - b.gain)
    .shift();

export const getBestOffers = (applicableOffers, chosenItems, itemValues) =>
  getBestScenario(getOverlappingScenarios(applicableOffers, chosenItems, itemValues));
