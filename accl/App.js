import React, { Component } from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView, Image} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import * as shape from 'd3-shape';
import { Button } from 'react-native-elements';
import { AreaChart, Grid } from 'react-native-svg-charts';
import Axios from 'axios';
import uuid from 'uuid/v4';


export default class App extends Component {

  state = {
    data: [],
    final: [],
    locString: '',
    error: '',
    uploading: 0,
    isJourneyActive: false,
    journeyId: null
  }

  async componentDidMount() {
    
    StatusBar.setBackgroundColor('#2c3e50');
  }

  startJourney = async () => {
    Accelerometer.setUpdateInterval(300);
    await this.setState({journeyId: uuid()});
    try {
      this.setState({isJourneyActive: true, error: ''});
      
      Accelerometer.addListener(async ({x, y, z}) => {
        const data = [...this.state.data];
        const final = [...this.state.final];
        var str = this.state.locString + "";
        if (data.length > 50) {
          data.splice(0, 1);
        } 
          
        
        const location = await this.getLocation();

        delete location.coords.altitude;
        delete location.coords.accuracy;
        delete location.coords.heading;
        delete location.timestamp;

        if (final.length % 3 === 0) {
          str += location.coords.latitude + ',' + location.coords.longitude + ','
        }
        
        const point = 
        {x: parseFloat(x.toFixed(6)), 
          y: parseFloat(y.toFixed(6)), 
          z: parseFloat(z.toFixed(6)), 
          jid: this.state.journeyId,
          timestamp: Date.now(), location};
        data.push(point);
        final.push(point);
        this.setState({data, final, locString: str});
      });
    } catch(e) {
      console.log(e);
      this.setState({error: 'GPS Signal not found. Please make sure that you have an active GPS signal.', isJourneyActive: false});
      return;
    }
  }

  stopJourney = async () => {
    try {
      // formData.append('api_option', 'paste');
      // formData.append('api_dev_key', '68f68d05fa6d78390ba237dce7c36cbb');
      // formData.append('api_paste_code', JSON.stringify(this.state.final));
      this.setState({uploading: 1});
      const formData = new FormData();
      formData.append('data', JSON.stringify(this.state.final))
      const {data} = await Axios.post('http://192.168.0.104:8000/', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(data);
      this.setState({uploading: 2});
    } catch(e) {  
      this.setState({uploading:0, error: 'Data Upload Failed.'})
      console.log(e);
    }
    this.setState({isJourneyActive: false, data: [{x:0, y:0, z:0}]});
    Accelerometer.removeAllListeners();
  }

  getLocation = async () => {
    const {status} = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({error: 'Location Permission Not Granted.'});
      return {};
    }

    let location = await Location.getCurrentPositionAsync();
    console.log(location);
    return location;
  }

  render() {

    const {data, error, isJourneyActive, uploading, locString} = this.state;
    const x = data.map(({x}) => x);
    const y = data.map(({y}) => y);
    const z = data.map(({z}) => z);
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerBar}>
          <Text style={styles.welcome}>Road Roughness Index</Text>
        </View>
        {!isJourneyActive && <View>
          <Text style={[styles.text, {color: '#e74c3c'}]}>{error}</Text>
          <Text style={styles.text}>Keep your phone vertically using a phone holder before starting the Journey.</Text>
          <Button 
          raised 
          title="Start Journey" 
          onPress={this.startJourney}
          buttonStyle={styles.button}  
          containerStyle={styles.buttonCont} />
          {uploading === 2 && <Text style={[styles.text, {color: '#2ecc71'}]}>Data uploaded successfully.</Text>}
        </View>}
        {isJourneyActive && <View>
        <Text style={styles.text}>X:{x[x.length - 1]}</Text>
        <AreaChart
          yMax={1}
          yMin={-1}
          data={[...x]}
          style={{height: 100, width: '100%', paddingVertical: 10,}}
          curve={shape.curveNatural}
          svg={{ fill: '#27ae60', fillOpacity: 0.3}}
        />
        <Text style={styles.text}>Y:{y[y.length - 1]}</Text>
        <AreaChart
          yMax={1}
          yMin={-1}
          data={[...y]}
          style={{height: 100, width: '100%', paddingVertical: 10,}}
          curve={shape.curveNatural}
          svg={{fill: '#e74c3c', fillOpacity: 0.3}}
        />
        <Text style={styles.text}>Z:{z[z.length - 1]}</Text>
        <AreaChart
            yMax={2}
            yMin={-1}
            data={[...z]}
            style={{minHeight: 100, width: '100%', paddingVertical: 10,}}
            curve={shape.curveNatural}
            svg={{fill: '#2980b9', fillOpacity: 0.3}}
          />
        
          <Button raised 
          title="Stop Journey" 
          loading={this.state.uploading === 1}
          onPress={this.stopJourney}
          buttonStyle={styles.button} 
          containerStyle={styles.buttonCont} />
        </View>} 
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerBar: {
    height: 60,
    justifyContent: 'center',
    backgroundColor: '#34495e',
    elevation: 4
  },  
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffff',
    margin: 20,
  },
  buttonCont: {
    width: 120,
    marginVertical: 30,
    alignSelf: 'center'
  },
  button: {
    backgroundColor: '#34495e'
  },
  text: {
    textAlign: 'center',
    color: '#000',
    margin: 20,
  },
});
