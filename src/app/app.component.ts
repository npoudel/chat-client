import { Component } from '@angular/core';
    import Chatkit from '@pusher/chatkit-client';
    import axios from 'axios';

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })

    export class AppComponent {
      title = 'Angular Chatroom';
      messages = [];
      users = [];
      currentUser: any;
     
    

      _username: string = '';
      get username(): string {
        return this._username;
      }
      set username(value: string) {
        this._username = value;
      }

      _message: string = '';
      get message(): string {
        return this._message;
      }
      set message(value: string) {
        this._message = value;
      }

      sendMessage() {
        const { message, currentUser } = this;
        currentUser.sendMessage({
          text: message,
          roomId: '<your room id>',
        });
        this.message = '';
      }

      addUser(event) {
        event.preventDefault();
        const { username } = this;
        console.log(username)
        axios.post('http://localhost:4000/users', { username })
          .then((res) => {
            console.log('usercreated',res)
            const tokenProvider = new Chatkit.TokenProvider({
              url: 'http://localhost:4000/authenticate',
              queryParams:{
                user_id:username
              }
            });

            console.log('tokenprovider',tokenProvider)

            const chatManager = new Chatkit.ChatManager({
              instanceLocator: 'v1:us1:cd19999f-42b3-492b-9324-42ed8835e698',
              userId: username,
              tokenProvider
            });

            return chatManager
              .connect()
              .then(currentUser => {
                console.log('currentUser',currentUser)
                currentUser.subscribeToRoom({
                  roomId: '0705bbf3-2941-4d01-98b5-bcc314112d54',
                  messageLimit: 100,
                  hooks: {
                    onMessage: message => {
                      this.messages.push(message);
                    },
                    onPresenceChanged: (state, user) => {
                      this.users = currentUser.users.sort((a, b) => {
                        if (a.presence.state === 'online') return -1;

                        return 1;
                      });
                    },
                  },
                });

                this.currentUser = currentUser;
                this.users = currentUser.users;
              });
          })
            .catch(error => console.error(error))
      }
    }