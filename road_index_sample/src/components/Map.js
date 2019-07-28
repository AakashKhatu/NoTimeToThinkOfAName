import React, { Component } from 'react'
import Fab from '@material-ui/core/Fab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dark from '@material-ui/icons/Brightness2';
import Light from '@material-ui/icons/WbSunny';
import SearchIcon from '@material-ui/icons/Search';
import Snackbar from '@material-ui/core/Snackbar';
import '../styles/map.css';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Axios from 'axios';

class Map extends Component {

    constructor(props) {
        super(props);

        this.platform = null;
        this.map = null;

        this.state = {
            theme: 'normal.night',
            place1: '',
            place2: '',
            lat:  18.96203663,
            long: 72.83206653,
            error: null,
            suggestions: [],
            loading: false
        }
    }

    getIndexes = async () => {
        const {data} = await Axios.get('http://192.168.0.104:8000/getdata/-1/');
        console.log(data);
        const lineString = new window.H.geo.LineString();
        data.forEach(({latitude, longitude}) => {
            lineString.pushLatLngAlt(latitude, longitude);
        });

        const polyline = new window.H.map.Polyline(lineString, {
            style: {
              lineWidth: 4,
              strokeColor: this.getColorFromIndex(Math.random())
            }
        });
       this.map.addObject(polyline);
    }


    toggleTheme = () => {
        if (this.state.theme === 'normal.night') {
            this.setState({theme: 'normal.day'});
        } else {
            this.setState({theme: 'normal.night'});
        }

        const tiles = this.platform.getMapTileService({'type': 'base'});
        const layer = tiles.createTileLayer(
            'maptile',
            this.state.theme,
            256,
            'png',
        );
        this.map.setBaseLayer(layer);
    }

    onSearch = async () => {
        this.setState({loading: true});
        console.log(this.state.place1, this.state.place2);
        try {
            const {data: place1}  = await Axios.get(`https://places.cit.api.here.com/places/v1/autosuggest?at=${this.state.lat},${this.state.long}&q=${this.state.place1}&app_id=X8kyodr5TEFD79Uyl3dY&app_code=yglhnJ9JPDlsr9Rm6mQktA`);
            
            let wp1;
            place1.results.forEach((res) => {
                if (res.position) {
                    wp1 = res.position.join(',');
                    return;
                }
            });

            this.calculateRouteFromAtoB(`${this.state.lat},${this.state.long}`, wp1)
            console.log(place1);
        } catch(e) {
            console.log(e);
            this.setState({error: 'No Data for this area.'})
        }
        this.setState({loading: false});
    } 

    calculateRouteFromAtoB = (wp1='18.9289863,72.8337478', wp2='19.0388956,72.9111276') => {
        var router = this.platform.getRoutingService(),
          routeRequestParams = {
            mode: 'fastest;car',
            representation: 'display',
            routeattributes : 'waypoints,summary,shape,legs',
            maneuverattributes: 'direction,action',
            waypoint0: wp1,
            waypoint1: wp2 
          };
      
      
        router.calculateRoute(
          routeRequestParams,     
          this.onSuccess,
          () => {}
          );
      }

    onSuccess = (result) => {
       try {
        const route = result.response.route[0];
         this.addRouteShapeToMap(route);
       } catch(e) {
        console.log(e);
        this.setState({error: 'No Data Available for this area.'})
       }
    
      }

    getColorFromIndex = (index) => {
        console.log(index);
        if (index <= 0.2) {
            return '#2ecc71';
        } 
        if (index <= 0.5) {
            return '#f1c40f';
        }
        if (index <= 0.8) {
            return '#e67e22';
        }

        return '#e74c3c';
        
    }

    addRouteShapeToMap = (route) => {
        var lineString = new window.H.geo.LineString(),
          routeShape = route.shape,
          polyline;
        var randomArr = [0.1, 0.2 , 1, 0.3, 0.5];
        var lineStrs = [];
        console.log(routeShape.length);
        routeShape.forEach((point, i) => {
          
          var parts = point.split(',');

          if (i !== 0 && i % 45 === 0) {
              lineStrs.push(lineString);
              lineString = new window.H.geo.LineString();
          }
          lineString.pushLatLngAlt(parts[0], parts[1]);
        });
      
        
        lineStrs.forEach((l) => {
            polyline = new window.H.map.Polyline(
                l, { style: { lineWidth: 4, strokeColor: this.getColorFromIndex(Math.random())}}
            );
            this.map.addObject(polyline);
        })
       
        
        console.log(this.map.getViewModel());
      }

    changePlace = async (place, e) => {
        try {
            const value = e.target.value;
            this.setState({[place]: value});

            const {data} = await Axios.get(`http://autocomplete.geocoder.api.here.com/6.2/suggest.json?app_id=X8kyodr5TEFD79Uyl3dY&app_code=yglhnJ9JPDlsr9Rm6mQktA&query=${value}&beginHighlight=<b>&endHighlight=</b>`);
            console.log(data);
            if (data.suggestions && value.length > 0)
                this.setState({suggestions: data.suggestions}); 
            else 
                this.setState({suggestions: []})
        } catch(e) {
            console.log(e);
        }
    }

    getCurrentLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {
                await this.setState({lat: position.coords.latitude, long: position.coords.longitude});
            });
            return Promise.resolve();
        }
        return Promise.reject();
    }

    async componentDidMount() {
        await this.getCurrentLocation();
        
        this.platform = new window.H.service.Platform({
            apikey: 'nRRAG5km5PvmILTSRs7gZeZhi7EkjLtZiu3MU8cZks',
            app_id: 'X8kyodr5TEFD79Uyl3dY',
            app_code: 'yglhnJ9JPDlsr9Rm6mQktA',
            })
    
        const layers = this.platform.createDefaultLayers();
        this.map = new window.H.Map(
            document.getElementById('map'),
            layers.normal.map,
            {
                center: {lat: this.state.lat, lng: this.state.long},
                zoom: 13,
            });
            window.addEventListener('resize', () => this.map.getViewPort().resize());

        const events = new window.H.mapevents.MapEvents(this.map);
        const behavior = new window.H.mapevents.Behavior(events);
        const ui = window.H.ui.UI.createDefault(this.map, layers);

        this.calculateRouteFromAtoB();
    }

    handleSnackbarClose = () => {
        this.setState({error: null});
    }

    render() {
        const isDark = this.state.theme === 'normal.night';
        const {suggestions, loading} = this.state;
        return (
            <div>
                <Paper style={{backgroundColor: isDark ? '#000' : '#fff', color: isDark ? '#fff': '#000'}} className="searchbar">
                    <div className="searchbar-cont">
                    <InputBase
                    className={"input"}
                    style={{color: 'inherit'}}
                    value={this.state.place1}
                    onChange={(value) => this.changePlace('place1', value)}
                    placeholder="Search Road Roughness Index"
                    inputProps={{ 'aria-label': 'Search Road Roughness Index' }}
                    />
                    <IconButton className={"searchbtn"} style={{color: isDark ?  '#fff' : '#000'}} aria-label="search">
                    {!loading && <SearchIcon onClick={this.onSearch}/>}
                    {loading && <CircularProgress size={24}/>}
                    </IconButton>
                    </div>
                    {suggestions.length > 0 && <div className="suggestions">
                        {suggestions.map(({label}, index) => {
                            return (<p key={index} onClick={() => {
                                this.setState({suggestions: [],place1: label.replace(/<\/?b>/gmi, '') });
                                this.onSearch();
                            }} dangerouslySetInnerHTML={{__html: label}}></p>)
                        })}
                    </div>}
                </Paper>    
                
                            <div style={{width: '100vw', height: '100vh', background: 'grey', position: 'fixed' }} id="map" />1
                <Fab className={isDark ? "fab black" : "fab white"} onClick={this.toggleTheme}> 
                    {isDark? <Dark style={{color: '#fff'}} /> : <Light style={{color: '#000'}} />}
                </Fab>   
                <Snackbar
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                    }}
                    open={!!this.state.error}
                    autoHideDuration={6000}
                    className="snack"
                    onClose={this.handleSnackbarClose}
                    ContentProps={{
                    'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.error}</span>}
                />
                <Paper className="legend" style={{backgroundColor: isDark ? '#000' : '#fff', color: isDark ? '#fff' : '#000'}}>
                    <div>       
                        <p>Smooth Road</p>
                        <div style={{width: 30, margin: 10, height: 10, backgroundColor: this.getColorFromIndex(0.1)}}></div>
                    </div>
                    <div>
                        <p>Good Road</p>
                        <div style={{width: 30, margin: 10, height: 10, backgroundColor: this.getColorFromIndex(0.5)}}></div>
                    </div>
                    <div>
                        <p>Uneven Road</p>
                        <div style={{width: 30, margin: 10, height: 10, backgroundColor: this.getColorFromIndex(0.8)}}></div>

                    </div>
                    <div>
                        <p>Bumpy Road</p>
                        <div style={{width: 30, margin: 10, height: 10, backgroundColor: this.getColorFromIndex(1)}}></div>
                    </div>
                </Paper>
            </div>
        )
    }
}

export default Map
