"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_local_1 = require("passport-local");
const auth_service_1 = require("./auth.service");
let LocalStrategy = class LocalStrategy extends (0, passport_1.PassportStrategy)(passport_local_1.Strategy, 'local') {
    authService;
    constructor(authService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
        this.authService = authService;
    }
    async validate(email, password) {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
};
exports.LocalStrategy = LocalStrategy;
exports.LocalStrategy = LocalStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], LocalStrategy);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwuc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NhbC5zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBbUU7QUFDbkUsK0NBQW9EO0FBQ3BELG1EQUEwQztBQUMxQyxpREFBNkM7QUFHdEMsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLElBQUEsMkJBQWdCLEVBQUMseUJBQVEsRUFBRSxPQUFPLENBQUM7SUFDdkM7SUFBN0IsWUFBNkIsV0FBd0I7UUFDbkQsS0FBSyxDQUFDO1lBQ0osYUFBYSxFQUFFLE9BQU87WUFDdEIsYUFBYSxFQUFFLFVBQVU7U0FDMUIsQ0FBQyxDQUFDO1FBSndCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO0lBS3JELENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxRQUFnQjtRQUM1QyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVsRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDVixNQUFNLElBQUksOEJBQXFCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0YsQ0FBQTtBQWpCWSxzQ0FBYTt3QkFBYixhQUFhO0lBRHpCLElBQUEsbUJBQVUsR0FBRTtxQ0FFK0IsMEJBQVc7R0FEMUMsYUFBYSxDQWlCekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBVbmF1dGhvcml6ZWRFeGNlcHRpb24gfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBQYXNzcG9ydFN0cmF0ZWd5IH0gZnJvbSAnQG5lc3Rqcy9wYXNzcG9ydCc7XG5pbXBvcnQgeyBTdHJhdGVneSB9IGZyb20gJ3Bhc3Nwb3J0LWxvY2FsJztcbmltcG9ydCB7IEF1dGhTZXJ2aWNlIH0gZnJvbSAnLi9hdXRoLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG9jYWxTdHJhdGVneSBleHRlbmRzIFBhc3Nwb3J0U3RyYXRlZ3koU3RyYXRlZ3ksICdsb2NhbCcpIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhdXRoU2VydmljZTogQXV0aFNlcnZpY2UpIHtcbiAgICBzdXBlcih7XG4gICAgICB1c2VybmFtZUZpZWxkOiAnZW1haWwnLFxuICAgICAgcGFzc3dvcmRGaWVsZDogJ3Bhc3N3b3JkJyxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHZhbGlkYXRlKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPExvY2FsVXNlcj4ge1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCB0aGlzLmF1dGhTZXJ2aWNlLnZhbGlkYXRlVXNlcihlbWFpbCwgcGFzc3dvcmQpO1xuXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdJbnZhbGlkIGNyZWRlbnRpYWxzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVzZXI7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2NhbFVzZXIge1xuICBpZDogc3RyaW5nO1xuICBlbWFpbDogc3RyaW5nO1xuICBmaXJzdE5hbWU6IHN0cmluZztcbiAgbGFzdE5hbWU6IHN0cmluZztcbiAgdGVuYW50SWQ6IHN0cmluZztcbiAgYnJhbmNoSWQ/OiBzdHJpbmc7XG4gIHJvbGVzOiBzdHJpbmdbXTtcbiAgcGVybWlzc2lvbnM6IHN0cmluZ1tdO1xuICBtZmFFbmFibGVkOiBib29sZWFuO1xufSJdfQ==