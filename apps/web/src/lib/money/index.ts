type MoneyValue = {
  amount: number;
  currency: string;
};

type FormattedMoney = {
  value: string;
  symbol: string;
  code: string;
};

export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = "GHS") {
    if (!Number.isInteger(amount)) {
      throw new Error("Amount must be an integer representing minor units");
    }
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    this.amount = amount;
    this.currency = currency.toUpperCase();
  }

  static fromMajor(amount: number, currency: string = "GHS"): Money {
    const amountStr = amount.toFixed(2);
    const [major = "0", minor = "00"] = amountStr.split(".");
    const minorUnits = parseInt(major, 10) * 100 + parseInt(minor.padEnd(2, "0").slice(0, 2), 10);
    return new Money(minorUnits, currency);
  }

  static fromMinor(amount: number, currency: string = "GHS"): Money {
    const integerAmount = Math.round(amount);
    return new Money(integerAmount, currency);
  }

  toMajor(): number {
    return this.amount / 100;
  }

  toMinor(): number {
    return this.amount;
  }

  retrieveCurrency(): string {
    return this.currency;
  }

  format(options: { withSymbol?: boolean; withCode?: boolean; decimals?: number } = {}): string {
    const { withSymbol = true, withCode = false, decimals = 2 } = options;

    const majorAmount = this.toMajor();

    const formatter = new Intl.NumberFormat("en-GH", {
      style: withSymbol ? "currency" : "decimal",
      currency: this.currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    let result = formatter.format(majorAmount);

    if (withCode) {
      result = `${result} ${this.currency}`;
    }

    return result;
  }

  formatDetailed(): FormattedMoney {
    return {
      value: this.format({ withSymbol: false, decimals: 2 }),
      symbol: this.retrieveCurrencySymbol(),
      code: this.currency,
    };
  }

  retrieveCurrencySymbol(): string {
    const symbols: Record<string, string> = {
      GHS: "₵",
      USD: "$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      KES: "KSh",
      ZAR: "R",
    };

    return symbols[this.currency] || this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    if (this.amount < other.amount) {
      throw new Error("Result would be negative");
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error("Cannot multiply by negative factor");
    }
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  percentage(percent: number): Money {
    return this.multiply(percent / 100);
  }

  getEquals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  getIsGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error("Cannot compare money with different currencies");
    }
    return this.amount > other.amount;
  }

  getIsLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error("Cannot compare money with different currencies");
    }
    return this.amount < other.amount;
  }

  convert(toCurrency: string, exchangeRate: number): Money {
    if (exchangeRate <= 0) {
      throw new Error("Exchange rate must be positive");
    }

    const convertedAmount = Math.round(this.amount * exchangeRate);
    return new Money(convertedAmount, toCurrency);
  }

  toJSON(): MoneyValue {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  static fromJSON(data: MoneyValue): Money {
    return new Money(data.amount, data.currency);
  }

  static zero(currency: string = "GHS"): Money {
    return new Money(0, currency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toString(): string {
    return this.format();
  }
}

export function formatCurrency(
  amount: number,
  currency: string = "GHS",
  options: {
    isMinorUnits?: boolean;
    withSymbol?: boolean;
    withCode?: boolean;
    decimals?: number;
  } = {},
): string {
  const { isMinorUnits = true, ...formatOptions } = options;

  const money = isMinorUnits
    ? Money.fromMinor(amount, currency)
    : Money.fromMajor(amount, currency);

  return money.format(formatOptions);
}

export function createMoney(
  amount: number,
  currency: string = "GHS",
  isMinorUnits: boolean = true,
): Money {
  return isMinorUnits ? Money.fromMinor(amount, currency) : Money.fromMajor(amount, currency);
}

export function addMoney(...values: Money[]): Money {
  if (values.length === 0) {
    throw new Error("At least one money value is required");
  }

  const firstValue = values[0];
  if (!firstValue) {
    throw new Error("At least one money value is required");
  }

  const currency = firstValue.retrieveCurrency();

  values.forEach((value) => {
    if (value.retrieveCurrency() !== currency) {
      throw new Error("All money values must have same currency");
    }
  });

  return values.reduce((sum, value) => sum.add(value));
}

export function calculatePercentage(
  amount: number,
  percentage: number,
  currency: string = "GHS",
  isMinorUnits: boolean = true,
): Money {
  const money = isMinorUnits
    ? Money.fromMinor(amount, currency)
    : Money.fromMajor(amount, currency);

  return money.percentage(percentage);
}

export function formatForDashboard(
  amount: number,
  currency: string = "GHS",
  isMinorUnits: boolean = true,
): string {
  const roundedAmount = Math.round(amount);
  const money = isMinorUnits
    ? Money.fromMinor(roundedAmount, currency)
    : Money.fromMajor(roundedAmount, currency);

  const majorAmount = money.toMajor();

  if (majorAmount >= 1000000) {
    return `${money.retrieveCurrencySymbol()}${(majorAmount / 1000000).toFixed(1)}M`;
  } else if (majorAmount >= 1000) {
    return `${money.retrieveCurrencySymbol()}${(majorAmount / 1000).toFixed(1)}K`;
  } else {
    return money.format({ decimals: 0 });
  }
}
