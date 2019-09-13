import { Component } from '@angular/core';
import { ActionSheetController, ToastController, LoadingController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { UploadApiService } from '../core/upload-api/upload-api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  imageData: string;
  images:Array<string> = [];
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private cameraCtrl: Camera,
    private toastCtrl: ToastController,
    private uploadApiService: UploadApiService,
    private loadingCtrl:LoadingController
  ) { 
    this.getImages();
  }

  getImages(){
    this.uploadApiService.getImages().subscribe(res=>{
      this.images = this.images.concat(res);
    })
  }
  onClickSelect() {
    this.showActionSheet((id) => {
      this.openCamera(id);
    })
  }

  async showActionSheet(callback) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select image from..',
      buttons: [
        { text: 'From galery', handler: () => callback(0) },
        { text: 'Take a photo', handler: () => callback(1) }
      ]
    });
    actionSheet.present();
  }

  openCamera(sourceType: number) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.cameraCtrl.DestinationType.DATA_URL,
      encodingType: this.cameraCtrl.EncodingType.JPEG,
      mediaType: this.cameraCtrl.MediaType.PICTURE,
      sourceType: sourceType
    }
    this.cameraCtrl.getPicture(options).then((imageData) => {
      let base64 = 'data:image/jpeg;base64,' + imageData;
      this.images.push(base64);
      this.doUpLoadImage(base64);
    }, (err) => {
      this.showToast('Can not get image !');
    });
  }

 async doUpLoadImage(base64:string) {
    const loading = await this.createLoading();
    loading.present();
    this.uploadApiService.upLoadImage(base64).pipe(
      finalize(()=>loading.dismiss())
    ).subscribe(res => {
      this.showToast('Upload Success')
    }, e => {
      this.showToast('Upload Fail');
    })
  }
  async showToast(mess: string) {
    const toast = await this.toastCtrl.create({ message: mess, duration: 1000 });
    toast.present();
  }
  createLoading(){
    return this.loadingCtrl.create({duration:1000});
  }
}
