import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the current execution platform (Server vs Browser)
  const platformId = inject(PLATFORM_ID);
  let token: string | null = null;

  // ONLY read document.cookie if we are running in the browser
  if (isPlatformBrowser(platformId)) {
    token = getAuthCookie();
  }

  // If a token exists, append it to the outgoing headers
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};

// Your cookie parsing function remains safe inside this module scope
export function getAuthCookie(): string | null {
  const name = "auth_token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}
