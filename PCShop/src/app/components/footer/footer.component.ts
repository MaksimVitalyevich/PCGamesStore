import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { brightnessAnim } from '../../app.animations';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: '../../framing.style.scss',
  animations: [brightnessAnim]
})
export class FooterComponent {
  elemHover = false;
}
