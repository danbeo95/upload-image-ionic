import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
enum ENDPOINTS {
  UPLOAD_IMAGE = 'uploadImage',
  GET_IMAGES = 'getImages'
}
const API_URL: string = 'http://54.76.15.222:8090/api/';
const APP_ID: string = 'fe57bde1-3ef1-4530-9ba1-54e4649400a8'
@Injectable({
  providedIn: 'root'
})
export class UploadApiService {

  constructor(
    private http: HttpClient
  ) {

  }

  upLoadImage(base64: string) {
    let url: string = API_URL + ENDPOINTS.UPLOAD_IMAGE;
    let formData = new FormData();
    let blob = this.convertBase64ToBlob(base64);
    let fileName = new Date().toDateString();
    formData.append('file', blob, fileName);
    return this.http.post(url, formData, {
      params: {
        appId: APP_ID
      }
    });
  }

  getImages():Observable<Array<string>> {
    let url: string = API_URL + ENDPOINTS.GET_IMAGES;
    return this.http.get<{ status: string, result: Array<any> }>(url, {
      params: {
        appId: APP_ID
      }
    }).pipe(
      map(res => res.result.map(v=>v.url))
    )
  }

  private convertBase64ToBlob(base64: string) {
    const info = this.getInfoFromBase64(base64);
    const sliceSize = 512;
    const byteCharacters = window.atob(info.rawBase64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: info.mime });
  }

  private getInfoFromBase64(base64: string) {
    const meta = base64.split(',')[0];
    const rawBase64 = base64.split(',')[1].replace(/\s/g, '');
    const mime = /:([^;]+);/.exec(meta)[1];
    const extension = /\/([^;]+);/.exec(meta)[1];

    return {
      mime,
      extension,
      meta,
      rawBase64
    };
  }
}
