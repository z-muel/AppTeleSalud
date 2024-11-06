import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importar módulos de formularios

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    FormsModule,
    ReactiveFormsModule // Agregar módulos de formularios
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, SQLite],
  bootstrap: [AppComponent],
})
export class AppModule {}
