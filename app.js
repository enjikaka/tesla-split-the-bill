const milesCosts = [
  {
    desc: "Försäkring",
    amount: 10452,
    amountPeriod: 12,
  },
  {
    desc: 'Låneräntor',
    amount: 800,
    amountPeriod: 12,
  },
  {
    desc: 'Däckhotell',
    amount: 1300,
    amountPeriod: 6,
  },
  {
    desc: 'Piggdekksoblat',
    amount: 1400,
    condition: 'winter',
    amountPeriod: 6,
  },
  {
    desc: 'Garage',
    amount: 1200,
    condition: 'winter',
    amountPeriod: 6,
  },
  {
    desc: 'Biltvätt',
    amount: 130,
    amountPeriod: 1,
  }
];

const insuranceKmLimit = 20000;

const form = document.querySelector('form');
const dlElement = document.querySelector('#miles-costs');
const milesCostsSum = document.querySelector('#miles-costs-sum');
const kwhCostsSum = document.querySelector('#kwh-costs-sum');
const tripMilesCost = document.querySelector('#trip-miles-cost');
const tripKwhCost = document.querySelector('#trip-kwh-cost');
const summarySpans = document.querySelectorAll('summary span');
const ppa = document.querySelector('#per-person-amount');
const totalAmount = document.querySelector('#total-amount');

form.addEventListener('change', e => {
  if (e.currentTarget instanceof HTMLFormElement) {
    calculate(e.currentTarget);
  }
});

const kronor = n => new Intl.NumberFormat('no-NB', { style: 'currency', currency: 'NOK' }).format(n);

function renderDl (costsToUse, formData) {
  const { km, kwh, persons } = formData;

  dlElement.innerHTML = null;

  const nodes = costsToUse.map(cost => {
    const dt = stringToElements(`<dt>${cost.desc}</dt>`);
    const dd = stringToElements(`<dd>${kronor(cost.amount)}</dd>`);

    return [dt, dd];
  }).flat().flat();

  nodes.forEach(node => dlElement.appendChild(node));

  const sum = costsToUse.reduce((acc, cost) => {
    const costPerKm = (cost.amount / cost.amountPeriod) / (insuranceKmLimit / cost.amountPeriod);

    acc += costPerKm * 10;

    return acc;
  }, 0);

  milesCostsSum.textContent = kronor(sum);
  tripMilesCost.textContent = kronor(sum * (km / 10));

  const kWhAveragePrice = parseFloat(kwhCostsSum.textContent.replace(',', '.'));
  tripKwhCost.textContent = kronor(kWhAveragePrice * kwh);

  updateTotal(persons);
}

function updateTotal (persons) {
  const spans = [...summarySpans];
  const total = spans.reduce((acc, span) => {
    const text = span.textContent.replace(',', '.');
    const float = parseFloat(text);

    return acc + float;
  }, 0);

  totalAmount.textContent = kronor(total);
  ppa.textContent = kronor(total / persons);
}

function stringToElements(string) {
  const fragment = document.createRange().createContextualFragment(string);

  return [...fragment.children];
}

function calculate (formElement) {
  if (formElement instanceof HTMLFormElement) {
    const elements = formElement.elements;

    const formData = [...elements].reduce((acc, cur) => {
      acc[cur.name] = cur.value;

      return acc;
    }, {});

    const costRegardlessOfCondition = milesCosts.filter(cost => cost.condition === undefined);
    const costsRelatedToSeason = milesCosts.filter(cost => cost.condition === formData.season);

    const costsToUse = [
      ...costRegardlessOfCondition,
      ...costsRelatedToSeason,
    ];

    renderDl(costsToUse, formData);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  calculate(form);
});