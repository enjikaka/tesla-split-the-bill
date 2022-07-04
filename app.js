const milesCosts = [
  {
    desc: "Försäkring",
    amount: 13270.32, // 1 600 mil
    amountPeriod: 12,
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

const kronor = n => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(n);

function renderDl (costsToUse, formData) {
  const { km, kwh, persons } = formData;

  dlElement.innerHTML = null;

  const nodes = costsToUse.map(cost => {
    const dt = stringToElements(`<dt>${cost.desc} (${cost.amount / cost.amountPeriod} kr per mil)</dt>`);
    const dd = stringToElements(`<dd>${kronor(cost.amount)}</dd>`);
    const dd2 = stringToElements(`<dd>á ${cost.amountPeriod} mnd</dd>`);

    return [dt, dd, dd2];
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
  tripKwhCost.textContent = kronor(kWhAveragePrice * parseFloat(kwh));

  updateTotal(persons);
}

function updateTotal (persons) {
  const spans = [...summarySpans];
  const total = spans.reduce((acc, span) => {
    const text = span.textContent.replace(',', '.');
    console.log(text);
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

    const costsToUse = [
      ...costRegardlessOfCondition,
    ];

    renderDl(costsToUse, formData);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  calculate(form);
});