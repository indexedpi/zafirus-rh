import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-zafirus-logo',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 94 94"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="select-none flex-shrink-0"
      aria-hidden="true"
    >
      <path
        d="M58.75 82.2509L47 94.0009L0 47.0009L8.93002 38.2275H32.43L23.5 47.0009L35.72 59.0642L47 70.5009L58.75 82.2509Z"
        fill="white"
      />
      <path
        d="M35.25 11.75L47 0L94 47L85.2267 55.7733H61.7267L70.5 47L58.4367 34.9367L47 23.5L35.25 11.75Z"
        fill="white"
      />
      <path
        d="M64.7031 47.0009L46.9998 64.7042L29.4531 47.0009L38.2264 38.2275L46.9998 47.0009L55.9298 38.2275L64.7031 47.0009Z"
        fill="#459CDB"
      />
    </svg>
  `,
})
export class ZafirusLogoComponent {
  @Input() size = 30;
}
