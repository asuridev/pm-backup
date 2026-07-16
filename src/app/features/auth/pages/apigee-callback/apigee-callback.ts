import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  APIGEE_CALLBACK_MESSAGE,
  ApigeeCallbackMessage,
} from '../../models/apigee-callback-model';

/**
 * Punto de aterrizaje del `redirect_uri` de Apigee. Corre dentro del iframe
 * oculto que abre `ApigeeSession`: su único trabajo es leer `code` / `state` /
 * `error` de la query y reenviarlos a la ventana principal.
 *
 * No hace HTTP ni toca el store (CONSTITUTION §4): el canje del code ocurre en
 * el parent, que es quien tiene el `code_verifier`.
 */
@Component({
  selector: 'app-apigee-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class ApigeeCallback {
  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;

    // Fuera del iframe esta ruta no tiene destinatario: `window.parent` sería
    // esta misma ventana y el mensaje se perdería, dejando al usuario en una
    // pantalla vacía sin salida. Pasa si llega por un marcador, un F5 o una URL
    // escrita a mano, así que se le devuelve al portal.
    if (window.self === window.top) {
      inject(Router).navigateByUrl('/');
      return;
    }

    const message: ApigeeCallbackMessage = {
      type: APIGEE_CALLBACK_MESSAGE,
      code: params.get('code'),
      state: params.get('state'),
      error: params.get('error'),
    };

    // `targetOrigin` explícito: el code no debe filtrarse a otro origen.
    window.parent.postMessage(message, window.location.origin);
  }
}
