export interface HealthRisk {
  ingredient: string;
  risk: string;
  health_impact?: string;
}

export interface AlertItem {
  detected: boolean;
  explanation?: string;
}

export interface ResultData {
  product_name?: string;
  overall_verdict?: 'Avoid' | 'Caution' | 'Safe' | string;
  summary?: string;
  health_risks?: HealthRisk[];
  alerts?: {
    maida_trap?: AlertItem;
    sugar_trap?: AlertItem;
    fake_marketing?: AlertItem;
  };
  marketing_traps?: { claim: string; reality: string }[];
  population_warnings?: { children?: string; diabetics?: string };
}
