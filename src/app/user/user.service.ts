/**
 * File created by suenlue on 15.10.17.
 * Copyright (c) 2017 by netTrek GmbH & Co. KG
 */
import IUser from './user.interface';
import {
    ICacheFactoryService, ICacheObject, IHttpPromise, IHttpResponse, IHttpService, IPromise, IRequestConfig,
    IRequestShortcutConfig
} from 'angular';

interface ICookiesOptions {
    path?: string;
    domain?: string;
    expires?: string | Date;
    secure?: boolean;
}

interface ICookiesService {
    get( key: string ): string;

    getObject( key: string ): any;

    getObject<T>( key: string ): T;

    getAll(): any;

    put( key: string, value: string, options?: ICookiesOptions ): void;

    putObject( key: string, value: any, options?: ICookiesOptions ): void;

    remove( key: string, options?: ICookiesOptions ): void;
}

export interface IUserService {
    start: Date;
    last: Date;
    users: IUser[];
    addUser ( user?: IUser ) : IPromise<number | void>;
    getUserById ( id: number ): IPromise<IHttpResponse<IUser>>;
    refresh (): void;
}

export default class UserService implements IUserService {

    static $inject: string[] = [ '$cookies',
                                 '$http',
                                 '$cacheFactory'
    ];

    start: Date;
    last: Date;
    users: IUser[];

    private userCache: ICacheObject;

    constructor ( private $cookies: ICookiesService,
                  private $http: IHttpService,
                  private $cacheFactory: ICacheFactoryService
    ) {
        this.init ();
    }

    public refresh( ) {
        this.loadUsers();
    }

    getUserById ( id: number ): IPromise<IHttpResponse<IUser>> {
        const endpoint: string = 'http://rest-api.flexlab.de/index.php/api/user';
        return this.$http.get<IUser> ( endpoint + '/' + id );
    }

    public addUser ( user?: IUser ) : IPromise<number | void> {
        const payload: IUser = user || <IUser> {
            firstname: 'saban',
            lastname: 'uenlue',
            city: 'dorsten'
        };
        const endpoint: string = 'http://rest-api.flexlab.de/index.php/api/user';
        // post<T>(url: string, data: any, config?: IRequestShortcutConfig): IHttpPromise<T>;
        const promise: IPromise<number | void> = this.$http.post<IUser> ( endpoint, payload )
                                                     .then ( // IHttpResponse<IUser>
                                                         result => this.users.push(result.data),
                                                         ( error ) => {
                                                             console.error ( error );
                                                         }
                                                     );
        return promise;
    }

    private init (): any {
        this.userCache = this.$cacheFactory ( 'userCache' );
        const lastDate: string | undefined = this.$cookies.get ( 'last' );
        this.last                          = this.start = new Date ();
        if ( lastDate !== undefined ) {
            this.last = new Date ( lastDate );
        }

        this.$cookies.put ( 'last', this.start.toString () );

        // this.$cookies.putObject(  'userData' , {username:'saban', lastVisit:this.last} );
        // this.$cookies.remove( 'last' );

        this.loadUsers();

    }


    private loadUsers (): IPromise<void|IUser[]> {

        const user: IUser = <IUser> {
            firstname: 'saban',
            lastname: 'uenlue',
            city: 'dorsten'
        };
        const token: string = 'Saban Ünlü [netTrek]';
        const endpoint: string = 'http://rest-api.flexlab.de/index.php/api/user';
        const config: IRequestShortcutConfig = <IRequestShortcutConfig>{
            /* defined in module
            headers: {
                'Authorization': 'Bearer ' + window.btoa( 'netTrek' )
            }
            */
        };

        const promise: IPromise<void|IUser[]> = this.$http.get<IUser[]> ( endpoint, config )
                          .then ( // IHttpResponse<IUser[]>
                              (result) => {
                                  this.users = result.data;
                              },
                              ( error ) => {
                                  console.error ( error );
                              }
                          );
        return promise;
    }

}