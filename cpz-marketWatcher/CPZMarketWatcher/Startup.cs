using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CPZMarketWatcher.DataProviders;
using CPZMarketWatcher.Servises;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

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

            // проверяем наличие ключа  в запросе
            app.Use(async (context, next) =>
            {
                // получаем ключ из запроса
                key = context.Request.Headers["key"];

                if (key != privateKey)
                {
                    await context.Response.WriteAsync("Invalid key!");
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

