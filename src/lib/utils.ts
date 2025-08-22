// import { type ClassValue, clsx } from "clsx";
// import { cva } from "class-variance-authority";

// export function cn(...inputs: ClassValue[]) {
//   return clsx(inputs);
// }

// // Button variants using CVA
// export const buttonVariants = cva(
//   "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
//   {
//     variants: {
//       variant: {
//         default: "bg-blue-600 text-white hover:bg-blue-700",
//         secondary:
//           "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
//         outline:
//           "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//         ghost: "hover:bg-accent hover:text-accent-foreground",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default: "h-10 px-4 py-2",
//         sm: "h-9 rounded-md px-3",
//         lg: "h-11 rounded-md px-8",
//         icon: "h-10 w-10",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

// // Card variants
// export const cardVariants = cva(
//   "rounded-lg border bg-card text-card-foreground shadow-sm",
//   {
//     variants: {
//       variant: {
//         default:
//           "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
//         elevated:
//           "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg",
//         outline: "border-slate-200 dark:border-slate-700",
//       },
//       padding: {
//         none: "",
//         sm: "p-4",
//         default: "p-6",
//         lg: "p-8",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       padding: "default",
//     },
//   }
// );

// // Text variants
// export const textVariants = cva("", {
//   variants: {
//     variant: {
//       heading: "text-slate-900 dark:text-white",
//       body: "text-slate-600 dark:text-slate-300",
//       accent: "text-blue-600",
//       muted: "text-slate-500 dark:text-slate-400",
//     },
//     size: {
//       xs: "text-xs",
//       sm: "text-sm",
//       base: "text-base",
//       lg: "text-lg",
//       xl: "text-xl",
//       "2xl": "text-2xl",
//       "3xl": "text-3xl",
//       "4xl": "text-4xl",
//       "5xl": "text-5xl",
//       "6xl": "text-6xl",
//     },
//     weight: {
//       normal: "font-normal",
//       medium: "font-medium",
//       semibold: "font-semibold",
//       bold: "font-bold",
//     },
//   },
//   defaultVariants: {
//     variant: "body",
//     size: "base",
//     weight: "normal",
//   },
// });

// // Section variants
// export const sectionVariants = cva("", {
//   variants: {
//     padding: {
//       default: "py-16 px-4 sm:px-6 lg:px-8",
//       sm: "py-8 px-4 sm:px-6 lg:px-8",
//       lg: "py-24 px-4 sm:px-6 lg:px-8",
//     },
//     background: {
//       default: "",
//       white: "bg-white dark:bg-slate-900",
//       gray: "bg-slate-50 dark:bg-slate-800",
//     },
//   },
//   defaultVariants: {
//     padding: "default",
//     background: "default",
//   },
// });
