import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HttpAppService } from '../services/http.service';
import { FCM } from '@ionic-native/fcm/ngx';

declare var google;

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterContentInit {

	map;
	marker;
	@ViewChild('mapElement', { static: true }) mapElement;
	latlng;


	demoPandData;
	presentLoading;
	dismissLoading;
	loader;
	filteredSymptoms: any = [];
	selectedFilter: string = "All";


	constructor(private geolocation: Geolocation, private HttpAppService: HttpAppService, public loadingController: LoadingController, private fcm: FCM, public plt: Platform) {
		var self = this;
		self.presentLoading = async function () {
			self.loader = await self.loadingController.create({
				message: "Please Wait..."
			});
			await self.loader.present();
		}
	}



	ngAfterContentInit() {
		var self = this;
		self.getMapData();
	}

	ngOnInit() { }

	getMapData = () => {
		var self = this;
		self.selectedFilter = 'All';
		self.presentLoading();
		self.HttpAppService.getPandemicData()
			.subscribe(
				(data) => {
					console.log(data.map);
					self.demoPandData = data.map;
					self.demoPandData.forEach((eachcase) => {
						(eachcase.symptoms).forEach((eachSymptom) => {
							if (self.filteredSymptoms.indexOf(eachSymptom.symptoms) == -1) { self.filteredSymptoms.push(eachSymptom.symptoms) }
						})
					})
					self.loadMap();
				},
				(error) => {
					console.log(error)
				}
			);
	}

	loadMap = () => {
		var self = this;
		// this.geolocation.getCurrentPosition(
			// {
				// maximumAge: 1000, timeout: 50000,
				// enableHighAccuracy: true
			// }
		// ).then((resp) => {
			//self.latlng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
			self.latlng = new google.maps.LatLng(22.5726, 88.3639);
			self.map = new google.maps.Map(
				self.mapElement.nativeElement, {
				center: self.latlng,
				zoom: 3
			}
			);

			var mapload = new google.maps.event.addListenerOnce(self.map, 'tilesloaded', function () {
				self.loader.dismiss();
			});
			self.demoPandData.forEach((eachcase) => {
				var citySymptoms = [];
				citySymptoms.length = 0;
				var content = '<div id="content">' +
					'<div id="siteNotice">' +
					'</div>' +
					'<h1 id="firstHeading" class="firstHeading">' + eachcase.city + '</h1>';

				(eachcase.symptoms).forEach((eachSymptom) => {
					if (self.selectedFilter == 'All') {
						content = content +
							'<div id="bodyContent">' +
							'<p><b>' + eachSymptom.symptoms + '</b></p><p>Number of online references for <strong>' + eachcase.city + '</strong> and <strong>' + eachSymptom.symptoms + '</strong>: <strong>' + eachcase.occurance + '</strong></p>' +
							'</div>';
					} else {
						if (self.selectedFilter == eachSymptom.symptoms) {
							if (citySymptoms.indexOf(eachSymptom.symptoms) == -1) { citySymptoms.push(eachSymptom.symptoms); }
							content = content +
								'<div id="bodyContent">' +
								'<p><b>' + eachSymptom.symptoms + '</b></p><p>Number of online references for <strong>' + eachcase.city + '</strong> and <strong>' + eachSymptom.symptoms + '</strong>: <strong>' + eachcase.occurance + '</strong></p>' +
								'</div>';
						}
					}
				})
				content = content + '</div>';
				if (self.selectedFilter == 'All') {
					self.marker = new google.maps.Marker({
						map: self.map,
						draggable: false,
						animation: google.maps.Animation.DROP,
						title: eachcase.city,
						position: { lat: parseFloat(eachcase.latitude), lng: parseFloat(eachcase.longitude) }
					});
				} else if (citySymptoms.indexOf(self.selectedFilter) != -1) {
					self.marker = new google.maps.Marker({
						map: self.map,
						draggable: false,
						animation: google.maps.Animation.DROP,
						title: eachcase.city,
						icon: '../assets/icon/marker.png',
						position: { lat: parseFloat(eachcase.latitude), lng: parseFloat(eachcase.longitude) }
					});
				}
				if (self.selectedFilter == 'All') {
					var infowindow = new google.maps.InfoWindow();
					google.maps.event.addListener(self.marker, 'click', (function (marker) {
						return function () {
							infowindow.setContent(content);
							infowindow.open(self.map, marker);
						}
					})(self.marker));
				} else if (citySymptoms.indexOf(self.selectedFilter) != -1) {
					var infowindow = new google.maps.InfoWindow();
					google.maps.event.addListener(self.marker, 'click', (function (marker) {
						return function () {
							infowindow.setContent(content);
							infowindow.open(self.map, marker);
						}
					})(self.marker));
				}
			});
		// }, er => {
			// console.log(er),
				// self.loader.dismiss()
		// }).catch((error) => {
			// self.loader.dismiss(),
				// alert('Error getting location - ' + JSON.stringify(error))
		// });
		
		this.geolocation.watchPosition(
			{
				maximumAge: 1000, timeout: 50000,
				enableHighAccuracy: true
			}
		).subscribe((resp) => {
			console.log('Lat: ' + resp.coords.latitude + ' Lon:' + resp.coords.longitude);
		}, er => {
			// console.log(er),
			// 	self.loader.dismiss()
			self.loader.dismiss(),
				alert('Error getting location - ' + JSON.stringify(er));
		});
	}

}
