
//@flow


/*
This is React app that gets data from https://api.giosg.com/api/reporting/v1/rooms/84e0fefa-5675-11e7-a349-00163efdd8db/
chat-stats/daily/?start_date={start}&end_date={end} with HTTP get request to fetch chat counts between 'start date' and
'end date' given by the user. App takes also 'access token' as a input from the user that will give acces to the data that 
app is trying to get with the HTTP get request.

After receiving data, app will output values from fields total_conversation_count, total_user_message_count
and total_visitor_message_count. App will also make paginated table that shows maximum of 5 items at 
time from daily numbers, which can be found from data field by_date. Fields that are in table are 
conversation_count, missed_chat_count and visitors_with_conversation_count. User can also decide 
from 'chart type' menu  does app output table, chart of conversation_count by date, missed_chat_count by date
or visitors_with_conversation_count by date.

start date, end date and token are stored in localStorage so they are already populated if user comes back to app later time.

styles of the app are defined in files styles.css and input_styles.css
 */




import React, {Component} from 'react'
import axios from 'axios'
import {CanvasJSChart} from 'canvasjs-react-charts'
import {
  Menu,
  MenuItem,
  MenuButton
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { TablePagination } from 'react-pagination-table';
import './components/styles.css';
import './components/input_styles.css';
import header_background from "./components/header_pic.jpg";


class App extends Component {

  constructor(props){
    super(props)
    this.search = this.search.bind(this);
    this.onChangeStart = this.onChangeStart.bind(this);
    this.onChangeEnd = this.onChangeEnd.bind(this);
    this.onChangeToken = this.onChangeToken.bind(this)
    this.handleClick1=this.handleClick1.bind(this)
    this.handleClick2=this.handleClick2.bind(this)
    this.handleClick3=this.handleClick3.bind(this)
    this.handleClick4=this.handleClick4.bind(this)

    
    //defines starting values for the app
    this.state = {
      data: [],
      start:  '',
      end: '',
      token: '',
      data_found: false,
      options: {},
      chart_or_table:  true,
      tabletype:  1,
      
  }
  }

  // Makes HTTP get request with given start date, end date and access token. Then sets data_found to true if HTTP get request was successful else sets it false.
  search(start_date, end_date,token ) {
    
    axios.get(`https://api.giosg.com/api/reporting/v1/rooms/84e0fefa-5675-11e7-a349-00163efdd8db/chat-stats/daily/?start_date=${start_date}&end_date=${end_date}`,{
        headers: {
             'Authorization': `token ${token}`
         }
     })
     .then(response => {
         console.log(response)
         this.setState({datas: response.data})
         this.setState({data_found: true})
     })
     .catch(error=>{
         console.log(error)
         this.setState({errorMsg: 'Error retreiving data'})
         this.setState({data_found: false})
     })

    }
 

  //changes start value for what is given by the user and calls search function with new values
  //this function is called when user changes start date
  onChangeStart(e){
    this.setState({start: e.target.value})
    this.search( e.target.value, this.state.end, this.state.token)
  }
  //changes end value for what is given by the user and calls search function with new values
  //this function is called when user changes end date
  onChangeEnd(e){
    this.setState({end: e.target.value})
    this.search(this.state.start, e.target.value, this.state.token)
  }
  //changes token value for what is given by the user and calls search function with new values
  //this function is called when user changes access token
  onChangeToken(e){
    this.setState({token: e.target.value})
    this.search(this.state.start, this.state.end, e.target.value)
  }
  
  // sets chart_or_table to true
  // this function is called when table is selected from Chart type menu
  handleClick1(){
    this.setState({chart_or_table:true})
  }

  // sets chart_or_table to false and tabletype to 1
  // this function is called when conversation_count by date is selected from Chart type menu
  handleClick2(){
    this.setState({tabletype: 1})
    this.setState({chart_or_table:false})
    }

  
  // sets chart_or_table to false and tabletype to 2
  // this function is called when missed_chat_count by date is selected from Chart type menu
  handleClick3(){
  this.setState({tabletype: 2})
  this.setState({chart_or_table:false})
  }

  // sets chart_or_table to false and tabletype to 3
  // this function is called when visitors_with_conversation_count by date is selected from Chart type menu
  handleClick4(){
    this.setState({tabletype: 3})
    this.setState({chart_or_table:false})
  }
  
  
  componentDidMount(){

    //try to find start date, end date and access token from local storage
    this.searchData = JSON.parse(localStorage.getItem('storage_values'))
  
    //if finds start date, end date and access token from local storage sets them to the values of 
    //start, end and token and calls search function
    if(localStorage.getItem('storage_values')){
      this.setState({
        start: this.searchData.start,
        end: this.searchData.end,
        token: this.searchData.token
        })
  
      this.search(this.searchData.start,this.searchData.end, this.searchData.token )
        
      }
      
    //if there is no values in local storage sets smpty string to start, end and token
    else {
      this.setState({
        start: '',
        end: '',
        token: ''
      })
      }
  
      }
  
    
      componentWillUpdate(nextProps, nextState){
        
        //sets values in localstorage 
        localStorage.setItem('storage_values', JSON.stringify(nextState))
      }
 
    


  render(){

    const {datas, errorMsg, data_found,chart_or_table,tabletype}= this.state

    var options= {}


    //if data_found is true and chart_or_table is false(chart type is other that table) sets options for CanvasJSChart
    if(data_found && chart_or_table===false){

      var title = ""

      //determine from which data the chart is made depending on chart type
      if(tabletype===1){
        title = "conversation_count"
      }

      else if(tabletype===2){
        title = "missed_chat_count"
      }

      else{
        title =  "visitors_with_conversation_count"
      }


   
      var x_y_axis = []


      for (var i = 0; i < datas.by_date.length; i++){
        const d  = new Date(datas.by_date[i]['date'])
        const ye = new Intl.DateTimeFormat('en', {year:'numeric'}).format(d)
        const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d)
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
        x_y_axis[i] = { x: new Date(ye,mo-1,da) , y: datas.by_date[i][title]  } 
 
      }
     
      //optinons for the CanvasJSChart
      options = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2", 
        title:{
          text: `${title} by date`
        },
        axisY: {
          title: title,
         
        },
        axisX: {
          title: "Date",
     
          interval: 2
        },
        data: [{
          type: "line",
          toolTipContent: "Day {x}: {y}",
          dataPoints: x_y_axis
          
        }]
    }

 
  }

  
  return (
   
    <div className="App">
  
      <header className = "header"style={{ backgroundImage: `url(${header_background})` }}>

        <div className ="header_title">Awesome react app</div>

      </header> 

      <div >
        <div className ="inputs">

            <p className="start_title">Start date</p>

            <input // input for the start_date
            className = "startDate"
            type="text"
            name="start_date_Box"
            value = {this.state.start}
            placeholder="yyyy-mm-dd"
            onChange = {this.onChangeStart}
            />

          <p className="end_title">End date</p>
            
          <input // input for the end_date
            className = "endDate"    
            type="text"
            name="end_date_Box"
            value = {this.state.end}
            placeholder="yyyy-mm-dd"
            onChange = { this.onChangeEnd}
          />

          <p className="token_title">Access token</p>

          <input // input for the token
            className = "token"
            type="text"
            name="token_Box"
            value = {this.state.token}
            placeholder="Enter acces token here..."
            onChange = { this.onChangeToken}
            
          />
        </div>
    
        <div class = "tableandtitle">


          {<div className="menu"/*makes menu button for the chart types*/> 
            <Menu  menuButton={<MenuButton>Chart type</MenuButton>}>
            <MenuItem onClick ={ this.handleClick1}>Table</MenuItem>
            <MenuItem onClick ={ this.handleClick2}>conversation_count by date</MenuItem>
            <MenuItem onClick ={ this.handleClick3}>missed_chat_count by date</MenuItem>
            <MenuItem onClick ={ this.handleClick4}>visitors_with_conversation_count by date</MenuItem>
            </Menu>
          </div>}
        
    



          {<div className = "convCount">

            <h2>Total conversation count: </h2>

          {
          
            
          data_found ?  <div> { //if data_found is true prints total_conversation_count else 0
              
              <h1>{datas.total_conversation_count}</h1>

            } </div> : <h1> 0</h1>

          }
          </div>
          }

          {<div className = "userMes">

            <h2>Total user message count:</h2>

          {
          
          data_found ?  <div > { //if data_found is true prints total_user_message_count else 0
          
            <h1>{datas.total_user_message_count}</h1>

          } </div> : <h1> 0</h1>
          
          }

          </div>}
     
          {<div className ="visitorMes" >

            <h2>Total visitor message count:</h2>

            {
              data_found ?  <div> {//if data_found is true prints total_visitor_message_count else 0
  
              <h1>{datas.total_visitor_message_count}</h1>

              } </div> : <h1> 0</h1>
            }

          </div>}

          {   
        
          data_found ?  <div className = "tableBox" >  { // if data_found is true outputs table or chart depending on which chart type is selected

            chart_or_table ? <div>
        
              <TablePagination //makes table that shows maximum of 5 days at time and paginates if there is more
              headers={["Conversation count", "Missed chat count", "Visitors with conversation count", "Date" ] }
              data={datas.by_date }
              columns="conversation_count.missed_chat_count.visitors_with_conversation_count.date"
              perPageItemCount={ 5 }
              totalCount={datas.by_date.length }
              arrayOption={ [["size", 'all', ' ']] }
              className ="table"
              />

            </div> :

			        <CanvasJSChart options = {options}/>

          } 

          </div> : null

        
          }

        </div>

      </div>

    </div>
  );
  }
}

export default App;
