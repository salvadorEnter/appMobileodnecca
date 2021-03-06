const customization = require('%app.core%/customization');
const device = require('%app.core%/device');
const dialog = require('%app.core%/dialog');
const NomadView = require('%app.views%/nomad-view');
const geolocation = require('%app.core%/geolocation');
const FilteredListView = require('%app.views.list%/filtered-list-view');

customization.registerMainMenuItem({
    label: 'Consultar ubicaciones de Reuniones',

    iconKey: 'actions.location-view',
    rank: 1,
    route:'locations_view_meetings'
});

// Registrando nueva ruta citas_edit
customization.registerRoutes([{
    name: 'locations_meetings',      // Uniquely identifies the route
    steps: 'locations_view_meetings',     // Route hash fragment: '#hello'

    handler(options) {
        app.controller.loadScreen({
            isDynamic: true,
            view: LocationsView,
        });
    }
}]);

//Definición de nueva vista para edición de Ubicaciones
let LocationsView = customization.extend(NomadView, {
    // Se especifica el nombre del template
    template: 'locations-view-meetings',

    defCuentas: null,

    currentLatitud:null,
    currentLng:null,

    // Configure the header
    headerConfig: {
        title: 'Ubicaciones de Reuniones',
        buttons: {
            mainMenu: true
        },
    },

    //Definición de eventos
    events: {
        'click #linkCuenta': 'navigateCuenta',
    },

    initialize(options) {
        self = this;
        this._super(options);
        this.defCuentas=[];
        this.getCuentas();
        this.obtenerUbicacion();
    },

    getCuentas(){

        self=this;
        //CAMBIAR --- > asegurar regresar records, con atributos de infoWindow
        var params = {
            'fields':'id,name,quick_contact_c,business_type_c,account_type,assigned_user_id,assigned_user_name,gps_latitud_c,gps_longitud_c,visit_status_c,estrellas_c,photography_c',
            'order_by':'date_modified:DESC',
            'max_num':-1
        };

        //CAMBIAR
        var url = app.api.buildURL("GetAccountsForMapMeetings", '', {}, {});

        app.alert.show('accounts_load', {
            level: 'load',
            closeable: false,
            messages: app.lang.get('LBL_LOADING'),
        });

        app.api.call("read", url, null, {
            success: data => {

                self.defCuentas=data.records;
                var contextoApiCuentas=this;
                    //Se establece height dinámicamente, con base a la altura de la ventana
                    document.getElementById("map-meetings").setAttribute("style", "width: 100%;height: " + window.screen.height+'px');
                    var mapDiv = document.getElementById("map-meetings");

                    var map=plugin.google.maps.Map.getMap(mapDiv,{
                        'camera': {
                            'zoom': 7
                        }
                    });

                    if(data.records.length>0){

                        //Inicializando infowindow
                        var infowindow = new plugin.google.maps.HtmlInfoWindow();

                        // Add markers
                        var bounds = [];
                        for(var i=0;i<data.records.length;i++){

                            if(data.records[i].gps_latitud_c !="" && data.records[i].gps_longitud_c != ""){

                               var icono='img/icon-negro_.png';

                                bounds.push({"lat":data.records[i].gps_latitud_c,"lng":data.records[i].gps_longitud_c});

                                var marker = map.addMarker({
                                    'position': {"lat":data.records[i].gps_latitud_c,"lng":data.records[i].gps_longitud_c},
                                    'title': data.records[i].id,
                                    'icon': {
                                        'url': icono
                                    }
                                });

                                marker.on(plugin.google.maps.event.INFO_CLICK, function() {
                                    // Hide the infoWindow
                                    marker.hideInfoWindow();
                                });

                                marker.on(plugin.google.maps.event.MARKER_CLICK, function(markers, info) {

                                    //document.getElementById("map").setAttribute("style", "width: 100%;height: 400px");
                                    document.getElementById("map-meetings").setAttribute("style", "width: 100%;height: " + window.screen.height+'px');
                                    var idCuenta=info.getOptions().title;
                                    var definicionCuenta=self.search(idCuenta, self.defCuentas);

                                    var contenidoInfoWindow='<div class="tab" style="width: 330px;border-bottom: 1px solid #ddd">'+
                                    '<button class="tablinks" style="background-color:#ffffff;color:#337ab7;border-left:1px solid #dadada;border-right:1px solid #dadada;border-top:1px solid #dadada;">Reunión</button>'+
                                    '</div>'+
                                    '<div id="Cuenta" class="tabcontent">'+
                                    '<div id="contenidoCuenta" style="padding: 10px;">'+
                                    '<p>Visita: <b><a href="#Meetings/'+definicionCuenta.id+'"target="_blank"> '+definicionCuenta.name+'</a></b></p>'+
                                    '<p>Realizó la visita: <b><a href="#Users/'+definicionCuenta.id_usuario+'"target="_blank"> '+definicionCuenta.nombre_usuario+'</a></b></p>'+
                                    '<p>Fecha y hora Check in: <b> '+definicionCuenta.fecha_fin+'</b></p>'+
                                    '<p>Fecha y hora Check out: <b> '+definicionCuenta.fecha_fin+'</b></p>'+
                                    '<p>Cliente relacionado: <b><a href="#Accounts/'+definicionCuenta.parent_id+'"target="_blank"> '+definicionCuenta.parent_name+'</a></b></p>'+
                                    '<p>Coincide con el domicilio registrado:'+definicionCuenta.coincide+'</p>'+
                                    '</div>'+
                                    '</div>';


                                    infowindow.setContent(contenidoInfoWindow);
                                    infowindow.open(this);

                                });
                            }//if lat lng
                        }//for

                        // Set a camera position that includes all markers.
                        map.moveCamera({
                            target: bounds
                        });
                    }//if length data.records
                },//end success api call
                error: er => {
                    app.alert.show('api_carga_error', {
                        level: 'error',
                        autoClose: true,
                        messages: 'Error al cargar datos: '+er,
                    });
                },
                complete: () => {
                    app.alert.dismiss('accounts_load');
                },
            });//App.api.call
    },//end getCuentas

    obtenerUbicacion(){
        self=this;

        app.alert.show('getLatLng', {
          level: 'load',
          closeable: false,
          messages: 'Cargando, por favor espere',
      });
        geolocation.getCurrentPosition({
          successCb: (position) => {
            app.alert.dismiss('getLatLng');

            self.currentLatitud=position.coords.latitude;
            self.currentLng=position.coords.longitude;
            document.getElementById("map-meetings").setAttribute("style", "width: 100%;height: " + window.screen.height+'px');
            var mapDiv = document.getElementById("map-meetings");

            var map=plugin.google.maps.Map.getMap(mapDiv,{
                'camera': {
                    'zoom': 7
                }
            });

            var currentLocationMarker = map.addMarker({
                'position': {"lat":self.currentLatitud,"lng":self.currentLng},
                'title': 'Usted está aquí',
                'icon': {
                    'url': 'img/iconCurrentLocation.png'
                }
            });

                        // Show the infoWindow
                        currentLocationMarker.showInfoWindow();
                    },
                    errorCb: (errCode, errMessage) => {
                        app.alert.dismiss('getLatLng');
                        app.alert.show('getLatLngError', {
                            level: 'error',
                            autoClose: true,
                            messages: 'No se ha podido obtener la ubicación',
                        });
                    },
                    enableHighAccuracy: false,
                    timeout: 300000,
                });

    },

    search:function(key,defCuentas){
        for(var i=0;i<defCuentas.length;i++){
            if(defCuentas[i].id===key){
                return defCuentas[i];
            }
        }
    },

    generarURLImage : function (module, id, field,_hash) {
        var url = app.api.buildFileURL({
            module : module,
            id : id,
            field : field
        }) + "&_hash=" + _hash;
        return url;
    },

    onAfterRender(){
        document.getElementById("map-meetings").setAttribute("style", "width: 100%;height: " + window.screen.height+'px');
        var mapDiv = document.getElementById("map-meetings");

        // Initialize the map plugin
        var map = plugin.google.maps.Map.getMap(mapDiv);

        // You have to wait the MAP_READY event.
        map.one(plugin.google.maps.event.MAP_READY, this.onMapInit);
    },

    onMapInit(map) {

        // Add a marker
        /*
        map.addMarker({
            'position': {"lat": 19.4326018, "lng": -99.13320490000001},
            'title': "MARKER ESTATICO!"
        }, function(marker) {
            // Show the infoWindow
            marker.showInfoWindow();
        });
        */

    }
});

module.exports = LocationsView;
