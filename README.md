# Inverse

A simple dependency service.

## Services <Injectables>

Services is where you create your container tokens.

```ts
import { token } from "cmdo-inverse";

type Constructor = {
  new (): Country;
}

export type Country = {
  greet(): string;
}

export type CountryToken = Token<Constructor, Country>;
```

## Providers

Providers are implementation details for the injectable services and are registered with the container.

```ts
import { Country } from "country";

export class USA implements Country {
  greet(): string {
    return "Howdy";
  }
}

export class UK implements Country {
  greet(): string {
    return "Hello";
  }
}
```

## Tokens

```ts
import { CountryToken } from "services/country";

export type Countries = {
  usa: CountryToken;
  uk: CountryToken;
}
```

## Container

Inverse container consists of a list of injectable transient and singleton tokens. A token consists of a `constructor` and `type` definition.

```ts
import { Container } from "cmdo-inverse";
import { Tokens } from "tokens";

export const container = new Container<Tokens>();
```

#### Register Dependency Providers

```ts
import { container } from "container";
import { USA, UK } from "countries";

container
  .register("usa", USA)
  .register("uk", UK);
```

## Sample Usage

```ts
import { container } from "container";

export class Sample {
  constructor(public country = container.resolve("usa")) {};
}

const sample = new Sample();

// typeof sample.country === Country
```