import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfigService } from './service/appconfigservice';
import { AppConfig } from './domain/appconfig';
import { Subscription } from 'rxjs';
import { PrimeNGConfig } from 'primeng/api';

declare let gtag: Function;

@Component({
  selector: 'app-main',
  templateUrl: './app.main.component.html',
})
export class AppMainComponent implements OnInit {
    menuActive: boolean;

    newsActive: boolean = true;

    config: AppConfig;

    news_key = 'primenews';

    theme: string = "lara-light-indigo";

    public subscription: Subscription;

    constructor(private router: Router, private configService: AppConfigService, private primengConfig: PrimeNGConfig) {}

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.config = this.configService.config;
        this.subscription = this.configService.configUpdate$.subscribe(config => {
            this.config = config;
        });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                gtag('config', 'UA-93461466-1',
                      {
                        'page_path': '/primeng' + event.urlAfterRedirects
                      }
                );

                this.hideMenu();
             }
        });

        this.newsActive = this.newsActive && this.isNewsStorageExpired();

        let appTheme;
        const queryString = window.location.search;

        if (queryString)
            appTheme = new URLSearchParams(queryString.substring(1)).get('theme');

        if (appTheme) {
            let darkTheme = this.isDarkTheme(appTheme);
            this.changeTheme({
                theme: appTheme,
                dark: darkTheme
            });
        }
    }

    onMenuButtonClick() {
        this.menuActive = true;
        this.addClass(document.body, 'blocked-scroll');
    }

    onMaskClick() {
        this.hideMenu();
    }

    hideMenu() {
        this.menuActive = false;
        this.removeClass(document.body, 'blocked-scroll');
    }

    addClass(element: any, className: string) {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }

    removeClass(element: any, className: string) {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    hideNews() {
        this.newsActive = false;
        const now = new Date();
        const item = {
            value: false,
            expiry: now.getTime() + 604800000,
        }
        localStorage.setItem(this.news_key, JSON.stringify(item));
    }

    isNewsStorageExpired() {
        const newsString = localStorage.getItem(this.news_key);
        if (!newsString) {
            return true;
        }
        const newsItem = JSON.parse(newsString);
        const now = new Date()

        if (now.getTime() > newsItem.expiry) {
            localStorage.removeItem(this.news_key);
            return true;
        }

        return false;
    }

    changeTheme(event) {
        let href = 'assets/components/themes/' + event.theme + '/theme.css';
        document.getElementById('theme-link').setAttribute('href', href);
        
        if(this.config){
            this.config.dark = event.dark;
            this.config.theme = event.theme;
            this.configService.updateConfig(this.config);
         
            if (this.config.theme === 'nano')
                this.applyScale(12);
        }

        if (event.theme.startsWith('md')) {
            this.config.ripple = true;
        }

    }

    isDarkTheme(theme) {
        return theme.indexOf('dark') !== -1 || theme.indexOf('vela') !== -1 || theme.indexOf('arya') !== -1 || theme.indexOf('luna') !== -1;
    }

    applyScale(scale: number) {
        document.documentElement.style.fontSize = scale + 'px';
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

