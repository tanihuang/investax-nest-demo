import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const transform = (item: any) => {
          if (item?.toObject) {
            return instanceToPlain(item.toObject());
          }
          return instanceToPlain(item);
        };

        if (Array.isArray(data)) {
          return data.map(transform);
        }

        return transform(data);
      }),
    );
  }
}
