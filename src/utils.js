import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const formatDate = (date) => dayjs(date).format('MMM DD');

const formatTime = (date) => dayjs(date).format('HH:mm');

const formatEditDate = (date) => date ? dayjs(date).format('DD/MM/YY HH:mm') : '';

const calculateDuration = (dateFrom, dateTo) => {
  const diff = dayjs.duration(dayjs(dateTo).diff(dayjs(dateFrom)));
  const totalDays = Math.floor(diff.asDays());
  const hours = diff.hours();
  const minutes = diff.minutes();

  if (totalDays > 0) {
    return `${String(totalDays).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }
  return `${String(minutes).padStart(2, '0')}M`;
};

const formatDateTime = (date) => dayjs(date).format('YYYY-MM-DDTHH:mm');

const formatDateForTitle = (date) => dayjs(date).format('DD MMM').toUpperCase();

const getInfoTitle = (points, destinations) => {
  if (!points || !points.length) {
    return '';
  }

  const destinationNames = points.map((point) => {
    const destination = destinations.find((d) => d.id === point.destination);
    return destination ? destination.name : '';
  });

  destinationNames.filter((element) => element);

  if (destinationNames.length <= 3) {
    return destinationNames.join(' — ');
  }

  const first = destinationNames[0];
  const last = destinationNames[destinationNames.length - 1];

  return `${first} —... — ${last}`;
};

const getInfoDates = (points) => {
  if (!points.length) {
    return null;
  }

  const sortedPoints = [...points].sort((a, b) =>
    new Date(a.dateFrom) - new Date(b.dateFrom)
  );

  return {
    start: formatDateForTitle(sortedPoints[0].dateFrom),
    end: formatDateForTitle(sortedPoints[sortedPoints.length - 1].dateTo)
  };
};

function getTotalCost(points, offers) {
  return points.reduce((total, point) => {
    const pointOffers = offers[point.type] || [];
    const selectedOffersCost = pointOffers
      .filter((offer) => point.offers.includes(offer.id))
      .reduce((sum, offer) => sum + offer.price, 0);
    return total + point.basePrice + selectedOffersCost;
  }, 0);
}

const countFuturePoints = (points) => {
  const now = new Date();
  return points.filter((point) => new Date(point.dateFrom) > now).length;
};

const countPresentPoints = (points) => {
  const now = new Date();
  return points.filter((point) =>
    new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now
  ).length;
};

const countPastPoints = (points) => {
  const now = new Date();
  return points.filter((point) => new Date(point.dateTo) < now).length;
};

const isEscKey = (evt) => evt.key === 'Escape';

export {
  formatDate,
  formatTime,
  formatEditDate,
  calculateDuration,
  formatDateTime,
  formatDateForTitle,
  getInfoTitle,
  getInfoDates,
  getTotalCost,
  countFuturePoints,
  countPresentPoints,
  countPastPoints,
  isEscKey
};
