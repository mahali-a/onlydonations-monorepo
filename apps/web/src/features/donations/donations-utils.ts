import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const getDateRange = (monthOffset: number = 0) => {
  const now = dayjs().utc();
  const startDate = now.add(monthOffset, "month").startOf("month").toDate();
  const endDate = now.add(monthOffset, "month").endOf("month").toDate();

  return { startDate, endDate };
};

export const calculatePaginationMetadata = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
