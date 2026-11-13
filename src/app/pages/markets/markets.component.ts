import { Component, signal, computed } from '@angular/core';

interface Quote { name: string; region: string; value: string; change: number; spark: number[]; }

@Component({
  selector: 'app-markets',
  standalone: true,
  templateUrl: './markets.component.html',
  styleUrls: ['./markets.component.scss'],
  host: { class: 'pg' }
})
export class MarketsComponent {
  tabs = ['Equities', 'Commodities', 'Currencies', 'Crypto'];
  active = signal('Equities');

  data: Record<string, Quote[]> = {
    Equities: [
      { name: 'DFM General Index', region: 'Dubai', value: '4,812.40', change: 0.84, spark: [3, 4, 4, 5, 4, 6, 7, 8] },
      { name: 'Tadawul All Share', region: 'Riyadh', value: '12,106.75', change: 0.31, spark: [5, 5, 6, 5, 6, 6, 7, 7] },
      { name: 'ADX General', region: 'Abu Dhabi', value: '9,534.12', change: -0.22, spark: [7, 7, 6, 6, 5, 6, 5, 5] },
      { name: 'Nifty 50', region: 'Mumbai', value: '24,892.10', change: 0.47, spark: [4, 5, 5, 6, 5, 7, 7, 8] },
      { name: 'S&P 500', region: 'New York', value: '6,021.30', change: 0.12, spark: [5, 6, 6, 6, 7, 6, 7, 7] },
      { name: 'FTSE 100', region: 'London', value: '8,412.66', change: -0.41, spark: [8, 7, 7, 6, 6, 5, 5, 4] }
    ],
    Commodities: [
      { name: 'Brent Crude', region: 'USD / bbl', value: '82.45', change: 0.76, spark: [4, 4, 5, 6, 5, 6, 7, 7] },
      { name: 'Gold', region: 'USD / oz', value: '2,684.90', change: 0.18, spark: [5, 5, 6, 6, 6, 7, 7, 8] },
      { name: 'Natural Gas', region: 'USD / MMBtu', value: '3.12', change: -1.05, spark: [7, 6, 6, 5, 5, 4, 4, 3] },
      { name: 'Copper', region: 'USD / lb', value: '4.38', change: 0.52, spark: [4, 5, 4, 5, 6, 6, 7, 7] }
    ],
    Currencies: [
      { name: 'USD / AED', region: 'Peg', value: '3.6725', change: 0.0, spark: [5, 5, 5, 5, 5, 5, 5, 5] },
      { name: 'USD / INR', region: 'Spot', value: '84.12', change: -0.09, spark: [6, 6, 6, 5, 6, 5, 5, 5] },
      { name: 'EUR / USD', region: 'Spot', value: '1.0840', change: 0.14, spark: [4, 5, 5, 5, 6, 6, 6, 7] },
      { name: 'GBP / USD', region: 'Spot', value: '1.2990', change: 0.07, spark: [5, 5, 6, 5, 6, 6, 6, 6] }
    ],
    Crypto: [
      { name: 'Bitcoin', region: 'USD', value: '98,420', change: 2.35, spark: [3, 4, 5, 5, 6, 7, 8, 9] },
      { name: 'Ethereum', region: 'USD', value: '3,640', change: 1.62, spark: [4, 4, 5, 6, 6, 7, 7, 8] },
      { name: 'Solana', region: 'USD', value: '214.8', change: -0.88, spark: [7, 7, 6, 7, 6, 5, 5, 5] }
    ]
  };

  rows = computed(() => this.data[this.active()]);

  movers = [
    { name: 'Emaar Properties', ticker: 'EMAAR', change: 3.4 },
    { name: 'Saudi Aramco', ticker: '2222', change: 1.1 },
    { name: 'Reliance Industries', ticker: 'RELIANCE', change: 0.9 },
    { name: 'Emirates NBD', ticker: 'EMIRATESNBD', change: -1.7 },
    { name: 'Careem Holdings', ticker: 'CRM', change: -2.3 }
  ];

  stories = [
    { tag: 'GCC Equities', title: 'Dubai bourse hits 17-year high as foreign inflows accelerate', time: '2h ago' },
    { tag: 'Energy', title: 'OPEC+ signals phased output increase through Q2', time: '4h ago' },
    { tag: 'Fixed Income', title: 'Sukuk issuance on pace for record year as spreads tighten', time: '6h ago' }
  ];

  bars(spark: number[]): string {
    return spark.map((v, i) => `${i * 12},${40 - v * 4}`).join(' ');
  }
}
