using CPZMarketWatcher.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace CPZMarketWatcher
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddSingleton<ProviderManager>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // вынимаем значение ключа из среды окружения
            var privateKey = Environment.GetEnvironmentVariable("API_KEY");

            string key;

            //проверяем наличие ключа в запросе
            app.Use(async (context, next) =>
            {
                // если используется первый апи, тогда проверяем ключ в заголовках
                if (context.Request.Path == "/api/import")
                {
                    // получаем ключ из запроса
                    key = context.Request.Headers["key"];

                    if (string.IsNullOrEmpty(key) || key != privateKey)
                    {
                        await context.Response.WriteAsync("Invalid key!");
                    }
                    else
                    {
                        await next.Invoke();
                    }
                }
                else
                {
                    await next.Invoke();
                }

            });

            app.UseMvc();
        }     
    }
}

