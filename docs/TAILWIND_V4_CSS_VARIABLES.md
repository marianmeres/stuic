# Tailwind CSS v4 - Core Non-Color CSS Variables

All theme variables defined via `@theme` in Tailwind v4. These are available as CSS custom properties in your compiled CSS.

---

## Spacing

Base multiplier for all spacing/sizing utilities (e.g., `p-4` = `calc(var(--spacing) * 4)`).

| Variable    | Default Value |
| ----------- | ------------- |
| `--spacing` | `0.25rem`     |

---

## Breakpoints

Responsive breakpoint variants (`sm:*`, `md:*`, etc.).

| Variable           | Default Value |
| ------------------ | ------------- |
| `--breakpoint-sm`  | `40rem`       |
| `--breakpoint-md`  | `48rem`       |
| `--breakpoint-lg`  | `64rem`       |
| `--breakpoint-xl`  | `80rem`       |
| `--breakpoint-2xl` | `96rem`       |

---

## Container / Max-Width

Used for container queries (`@sm:*`) and sizing utilities (`max-w-md`, etc.).

| Variable          | Default Value |
| ----------------- | ------------- |
| `--container-3xs` | `16rem`       |
| `--container-2xs` | `18rem`       |
| `--container-xs`  | `20rem`       |
| `--container-sm`  | `24rem`       |
| `--container-md`  | `28rem`       |
| `--container-lg`  | `32rem`       |
| `--container-xl`  | `36rem`       |
| `--container-2xl` | `42rem`       |
| `--container-3xl` | `48rem`       |
| `--container-4xl` | `56rem`       |
| `--container-5xl` | `64rem`       |
| `--container-6xl` | `72rem`       |
| `--container-7xl` | `80rem`       |

---

## Font Family

| Variable       | Default Value                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `--font-sans`  | `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"` |
| `--font-serif` | `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`                                                        |
| `--font-mono`  | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`                 |

---

## Font Size

Each size has an accompanying `--line-height` variable.

| Variable                   | Default Value        |
| -------------------------- | -------------------- |
| `--text-xs`                | `0.75rem`            |
| `--text-xs--line-height`   | `calc(1 / 0.75)`     |
| `--text-sm`                | `0.875rem`           |
| `--text-sm--line-height`   | `calc(1.25 / 0.875)` |
| `--text-base`              | `1rem`               |
| `--text-base--line-height` | `calc(1.5 / 1)`      |
| `--text-lg`                | `1.125rem`           |
| `--text-lg--line-height`   | `calc(1.75 / 1.125)` |
| `--text-xl`                | `1.25rem`            |
| `--text-xl--line-height`   | `calc(1.75 / 1.25)`  |
| `--text-2xl`               | `1.5rem`             |
| `--text-2xl--line-height`  | `calc(2 / 1.5)`      |
| `--text-3xl`               | `1.875rem`           |
| `--text-3xl--line-height`  | `calc(2.25 / 1.875)` |
| `--text-4xl`               | `2.25rem`            |
| `--text-4xl--line-height`  | `calc(2.5 / 2.25)`   |
| `--text-5xl`               | `3rem`               |
| `--text-5xl--line-height`  | `1`                  |
| `--text-6xl`               | `3.75rem`            |
| `--text-6xl--line-height`  | `1`                  |
| `--text-7xl`               | `4.5rem`             |
| `--text-7xl--line-height`  | `1`                  |
| `--text-8xl`               | `6rem`               |
| `--text-8xl--line-height`  | `1`                  |
| `--text-9xl`               | `8rem`               |
| `--text-9xl--line-height`  | `1`                  |

---

## Font Weight

| Variable                   | Default Value |
| -------------------------- | ------------- |
| `--font-weight-thin`       | `100`         |
| `--font-weight-extralight` | `200`         |
| `--font-weight-light`      | `300`         |
| `--font-weight-normal`     | `400`         |
| `--font-weight-medium`     | `500`         |
| `--font-weight-semibold`   | `600`         |
| `--font-weight-bold`       | `700`         |
| `--font-weight-extrabold`  | `800`         |
| `--font-weight-black`      | `900`         |

---

## Letter Spacing (Tracking)

| Variable             | Default Value |
| -------------------- | ------------- |
| `--tracking-tighter` | `-0.05em`     |
| `--tracking-tight`   | `-0.025em`    |
| `--tracking-normal`  | `0em`         |
| `--tracking-wide`    | `0.025em`     |
| `--tracking-wider`   | `0.05em`      |
| `--tracking-widest`  | `0.1em`       |

---

## Line Height (Leading)

| Variable            | Default Value |
| ------------------- | ------------- |
| `--leading-tight`   | `1.25`        |
| `--leading-snug`    | `1.375`       |
| `--leading-normal`  | `1.5`         |
| `--leading-relaxed` | `1.625`       |
| `--leading-loose`   | `2`           |

---

## Border Radius

| Variable       | Default Value |
| -------------- | ------------- |
| `--radius-xs`  | `0.125rem`    |
| `--radius-sm`  | `0.25rem`     |
| `--radius-md`  | `0.375rem`    |
| `--radius-lg`  | `0.5rem`      |
| `--radius-xl`  | `0.75rem`     |
| `--radius-2xl` | `1rem`        |
| `--radius-3xl` | `1.5rem`      |
| `--radius-4xl` | `2rem`        |

---

## Box Shadow

| Variable       | Default Value                                                         |
| -------------- | --------------------------------------------------------------------- |
| `--shadow-2xs` | `0 1px rgb(0 0 0 / 0.05)`                                             |
| `--shadow-xs`  | `0 1px 2px 0 rgb(0 0 0 / 0.05)`                                       |
| `--shadow-sm`  | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`       |
| `--shadow-md`  | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`    |
| `--shadow-lg`  | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`  |
| `--shadow-xl`  | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` |
| `--shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)`                                 |

---

## Inset Shadow

| Variable             | Default Value                       |
| -------------------- | ----------------------------------- |
| `--inset-shadow-2xs` | `inset 0 1px rgb(0 0 0 / 0.05)`     |
| `--inset-shadow-xs`  | `inset 0 1px 1px rgb(0 0 0 / 0.05)` |
| `--inset-shadow-sm`  | `inset 0 2px 4px rgb(0 0 0 / 0.05)` |

---

## Drop Shadow (Filter)

| Variable            | Default Value                   |
| ------------------- | ------------------------------- |
| `--drop-shadow-xs`  | `0 1px 1px rgb(0 0 0 / 0.05)`   |
| `--drop-shadow-sm`  | `0 1px 2px rgb(0 0 0 / 0.15)`   |
| `--drop-shadow-md`  | `0 3px 3px rgb(0 0 0 / 0.12)`   |
| `--drop-shadow-lg`  | `0 4px 4px rgb(0 0 0 / 0.15)`   |
| `--drop-shadow-xl`  | `0 9px 7px rgb(0 0 0 / 0.1)`    |
| `--drop-shadow-2xl` | `0 25px 25px rgb(0 0 0 / 0.15)` |

---

## Text Shadow

| Variable            | Default Value                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `--text-shadow-2xs` | `0px 1px 0px rgb(0 0 0 / 0.15)`                                                                  |
| `--text-shadow-xs`  | `0px 1px 1px rgb(0 0 0 / 0.2)`                                                                   |
| `--text-shadow-sm`  | `0px 1px 0px rgb(0 0 0 / 0.075), 0px 1px 1px rgb(0 0 0 / 0.075), 0px 2px 2px rgb(0 0 0 / 0.075)` |
| `--text-shadow-md`  | `0px 1px 1px rgb(0 0 0 / 0.1), 0px 1px 2px rgb(0 0 0 / 0.1), 0px 2px 4px rgb(0 0 0 / 0.1)`       |
| `--text-shadow-lg`  | `0px 1px 2px rgb(0 0 0 / 0.1), 0px 3px 2px rgb(0 0 0 / 0.1), 0px 4px 8px rgb(0 0 0 / 0.1)`       |

---

## Blur (Filter)

| Variable     | Default Value |
| ------------ | ------------- |
| `--blur-xs`  | `4px`         |
| `--blur-sm`  | `8px`         |
| `--blur-md`  | `12px`        |
| `--blur-lg`  | `16px`        |
| `--blur-xl`  | `24px`        |
| `--blur-2xl` | `40px`        |
| `--blur-3xl` | `64px`        |

---

## Perspective

| Variable                 | Default Value |
| ------------------------ | ------------- |
| `--perspective-dramatic` | `100px`       |
| `--perspective-near`     | `300px`       |
| `--perspective-normal`   | `500px`       |
| `--perspective-midrange` | `800px`       |
| `--perspective-distant`  | `1200px`      |

---

## Aspect Ratio

| Variable         | Default Value |
| ---------------- | ------------- |
| `--aspect-video` | `16 / 9`      |

---

## Easing (Transition Timing)

| Variable        | Default Value                  |
| --------------- | ------------------------------ |
| `--ease-in`     | `cubic-bezier(0.4, 0, 1, 1)`   |
| `--ease-out`    | `cubic-bezier(0, 0, 0.2, 1)`   |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |

---

## Animations

| Variable           | Default Value                                    |
| ------------------ | ------------------------------------------------ |
| `--animate-spin`   | `spin 1s linear infinite`                        |
| `--animate-ping`   | `ping 1s cubic-bezier(0, 0, 0.2, 1) infinite`    |
| `--animate-pulse`  | `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` |
| `--animate-bounce` | `bounce 1s infinite`                             |

### Keyframes

```css
@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@keyframes ping {
	75%,
	100% {
		transform: scale(2);
		opacity: 0;
	}
}

@keyframes pulse {
	50% {
		opacity: 0.5;
	}
}

@keyframes bounce {
	0%,
	100% {
		transform: translateY(-25%);
		animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
	}
	50% {
		transform: none;
		animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
	}
}
```

---

## Theme Variable Namespaces Reference

| Namespace          | Utility Classes                                              |
| ------------------ | ------------------------------------------------------------ |
| `--color-*`        | Color utilities (`bg-*`, `text-*`, `border-*`, etc.)         |
| `--font-*`         | Font family utilities (`font-sans`, etc.)                    |
| `--text-*`         | Font size utilities (`text-xl`, etc.)                        |
| `--font-weight-*`  | Font weight utilities (`font-bold`, etc.)                    |
| `--tracking-*`     | Letter spacing utilities (`tracking-wide`, etc.)             |
| `--leading-*`      | Line height utilities (`leading-tight`, etc.)                |
| `--breakpoint-*`   | Responsive variants (`sm:*`, `md:*`, etc.)                   |
| `--container-*`    | Container queries (`@sm:*`) and max-width (`max-w-md`, etc.) |
| `--spacing-*`      | Spacing/sizing utilities (`p-4`, `m-2`, `w-8`, etc.)         |
| `--radius-*`       | Border radius utilities (`rounded-sm`, etc.)                 |
| `--shadow-*`       | Box shadow utilities (`shadow-md`, etc.)                     |
| `--inset-shadow-*` | Inset shadow utilities (`inset-shadow-xs`, etc.)             |
| `--drop-shadow-*`  | Drop shadow filter utilities (`drop-shadow-md`, etc.)        |
| `--blur-*`         | Blur filter utilities (`blur-md`, etc.)                      |
| `--perspective-*`  | Perspective utilities (`perspective-near`, etc.)             |
| `--aspect-*`       | Aspect ratio utilities (`aspect-video`, etc.)                |
| `--ease-*`         | Transition timing utilities (`ease-out`, etc.)               |
| `--animate-*`      | Animation utilities (`animate-spin`, etc.)                   |

---

_Source: [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/theme)_
