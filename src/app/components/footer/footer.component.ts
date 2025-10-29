import { Component } from '@angular/core';
import { textColorAnim, brightnessAnim } from '../../app.animations';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: '../../framing.style.scss',
  animations: [textColorAnim, brightnessAnim]
})
export class FooterComponent {
  elemHover = false;
}
